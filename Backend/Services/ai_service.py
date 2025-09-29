import os
import sys
import jinja2
from typing import TypedDict, List, Dict, Any, NotRequired
import asyncio
import pprint

# --- LangChain & LangGraph Imports ---
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.output_parsers.json import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# --- Project Imports ---
# Add project root to path to solve import errors
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from config import GOOGLE_API_KEY, LLM_MODEL_NAME
from Services.vector_store_service import VectorStoreManager
from Services.document_processor_service import load_and_split_document


# --- 1. Define the State for the Graph ---
class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        file_paths: A list of file paths to process.
        report_plan: A structured plan including sections, KPIs, and chart focus.
        sections: The generated narrative content for each report section.
        chart: Data for the chart visualization, including a title and Chart.js data.
        final_report_data: The compiled context dictionary for the final HTML template.
    """
    file_paths: List[str]
    report_plan: NotRequired[Dict[str, Any]]
    sections: NotRequired[List[Dict[str, str]]]
    chart: NotRequired[Dict[str, Any]]
    final_report_data: NotRequired[Dict[str, Any]]


# --- 2. Initialize Models and Services ---
llm = ChatGoogleGenerativeAI(model=LLM_MODEL_NAME, google_api_key=GOOGLE_API_KEY, temperature=0.5)
vector_store = VectorStoreManager()
retriever = vector_store.get_retriever()


# --- 3. Define Graph Nodes ---

def process_files_node(state: GraphState):
    """Processes a batch of files, embedding new ones into the vector store."""
    print("---NODE: Processing Files (Batch)---")
    file_paths = state.get('file_paths', [])
    for file_path in file_paths:
        try:
            file_hash = vector_store.get_file_hash(file_path)
            exists = vector_store.check_document_exists(file_hash)
            if not exists:
                print(f"File '{file_path}' is new. Embedding...")
                documents = load_and_split_document(file_path)
                vector_store.add_documents(documents, file_hash)
            else:
                print(f"File '{file_path}' already exists. Skipping.")
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")
    return {}

def plan_report_node(state: GraphState):
    """Generates a structured plan, including sections, KPIs, and chart focus."""
    print("---NODE: Planning Report---")
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", 
             "You are an expert educational analyst. Create a structured plan for an annual report based on the provided context. "
             "Your response MUST be a single JSON object with four keys: "
             "1. 'institute_name': A string with the full name of the institute. "
             "2. 'kpis': A list of exactly 3 dictionaries, each with 'value' and 'label' keys for the most impactful statistics (e.g., student count, placement rate, financial surplus). "
             "3. 'plan': A dictionary where each key is a section title (e.g., 'President\'s Message', 'Financial Performance') and the value is a list of strings representing bullet points to cover. "
             "4. 'chart_title': A short, descriptive string for a chart summarizing the financial performance."),
            ("user", "Context from all provided documents:\n\n{context}\n\nGenerate the complete report plan now.")
        ]
    )
    
    # Retrieve a broad context for overall planning
    context_docs = retriever.invoke("Overall summary of the 2024-2025 academic and financial year for the Future Skills Academy")
    context_text = "\n".join([doc.page_content for doc in context_docs])
    
    chain = prompt | llm | JsonOutputParser()
    plan = chain.invoke({"context": context_text})
    
    return {"report_plan": plan}

def generate_sections_node(state: GraphState):
    """Generates narrative content for each section of the report plan."""
    print("---NODE: Generating Report Sections---")
    plan_data = state.get('report_plan', {})
    plan = plan_data.get('plan', {})
    sections_output = []

    for section_title, bullet_points in plan.items():
        print(f"-> Generating content for section: {section_title}")
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", 
                 "You are a professional writer for an educational institute. "
                 "Write a comprehensive and engaging narrative for the '{section}' section of the annual report. "
                 "Use the provided context to elaborate on these key points: {points}. "
                 "The tone should be professional, positive, and data-driven. "
                 "IMPORTANT: Do NOT include any conversational filler like 'Of course, here is...'. "
                 "Do NOT repeat the section title. Begin directly with the first sentence of the narrative."),
                ("user", "Context from relevant documents:\n\n{context}\n\nWrite the section now.")
            ]
        )
        
        context_docs = retriever.invoke(f"{section_title}: {', '.join(bullet_points)}")
        context_text = "\n".join([doc.page_content for doc in context_docs])
        
        chain = prompt | llm | StrOutputParser()
        section_content = chain.invoke({
            "section": section_title,
            "points": ", ".join(bullet_points),
            "context": context_text
        })
        
        sections_output.append({"title": section_title, "content": section_content})
        
    return {"sections": sections_output}

def generate_chart_node(state: GraphState):
    """Generates Chart.js compatible JSON for the financial summary chart."""
    print("---NODE: Generating Chart Data---")
    
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are a data visualization expert. Analyze the provided financial context. "
             "Aggregate the data to create a summary of major revenue and expense categories. "
             "Generate a JSON object compatible with Chart.js for a bar chart with two datasets: 'Revenue' and 'Expense'. "
             "The JSON response MUST be ONLY the JSON object, with no extra text. "
             "The format must be: {{ 'labels': [...], 'datasets': [{{ 'label': 'Revenue', 'data': [...] }}, {{ 'label': 'Expense', 'data': [...] }}] }}. "
             "Use the raw numerical values for the data, not strings with 'M'."),
            ("user", "Financial context from documents:\n\n{context}\n\nGenerate the Chart.js JSON object now.")
        ]
    )
    
    context_docs = retriever.invoke("Detailed financial data for the fiscal year, including all revenue and expense categories.")
    context_text = "\n".join([doc.page_content for doc in context_docs])
    
    chain = prompt | llm | JsonOutputParser()
    chart_js_data = chain.invoke({"context": context_text})
    
    # Get the chart title from the plan
    chart_title = state.get('report_plan', {}).get('chart_title', 'Financial Overview')
    
    return {"chart": {"title": chart_title, "data": chart_js_data}}

def compile_data_node(state: GraphState):
    """Prepares the final context dictionary for the Jinja2 template."""
    print("---NODE: Compiling Final Data---")
    
    plan_data = state.get('report_plan', {})
    
    template_context = {
        "title": f"Annual Report 2024-2025 | {plan_data.get('institute_name', 'Our Institute')}",
        "kpis": plan_data.get('kpis', []),
        "sections": state.get('sections', []),
        "chart": state.get('chart', None)
    }
    
    return {"final_report_data": template_context}


# --- 4. Define and Compile the Graph ---
graph = StateGraph(GraphState)

graph.add_node("process_files", process_files_node)
graph.add_node("plan_report", plan_report_node)
graph.add_node("generate_sections", generate_sections_node)
graph.add_node("generate_chart", generate_chart_node)
graph.add_node("compile_data", compile_data_node)

graph.set_entry_point("process_files")
graph.add_edge("process_files", "plan_report")
graph.add_edge("plan_report", "generate_sections")
graph.add_edge("generate_sections", "generate_chart")
graph.add_edge("generate_chart", "compile_data")
graph.add_edge("compile_data", END)

app_graph = graph.compile()


# --- 5. Manual Test Runner ---
if __name__ == "__main__":
    async def main():
        data_dir = os.path.join(project_root, "uploads")
        files_to_process = [
            os.path.join(data_dir, "FSA_Financials_2025.csv"),
            os.path.join(data_dir, "FSA_Academics_Faculty_Report_2025.docx"),
            # os.path.join(data_dir, "FSA_Student_Life_Notes_2025.txt"),
        ]

        initial_state: GraphState = {"file_paths": files_to_process}

        print("🚀 --- KICKING OFF AGENT BATCH RUN --- 🚀")
        final_state = app_graph.invoke(initial_state)
        print("\n✅ --- AGENT RUN COMPLETE --- ✅")

        if final_state:
            report_data = final_state.get("final_report_data")
            if report_data:
                try:
                    template_dir = os.path.join(project_root, "Templates")
                    template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
                    template_env = jinja2.Environment(loader=template_loader)
                    template = template_env.get_template("report_template.html")
                    html_report = template.render(report_data)
                    
                    report_path = os.path.join(project_root, "generated_report.html")
                    with open(report_path, "w", encoding="utf-8") as f:
                        f.write(html_report)
                    print(f"\n📄 Comprehensive report saved to {report_path}")

                except Exception as e:
                    print(f"\n❌ Error rendering or saving HTML template: {e}")
            else:
                print("\n❌ Agent did not produce report data. Final state:")
                pprint.pprint(final_state)
        else:
            print("\n❌ Agent run did not complete.")

    asyncio.run(main())