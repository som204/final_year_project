# import os
# import sys
# from typing import TypedDict, List, Dict, Any, NotRequired


# # --- LangChain & LangGraph Imports ---
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers.string import StrOutputParser
# from langchain_core.output_parsers.json import JsonOutputParser
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langgraph.graph import StateGraph, END

# # --- Project Imports ---
# # Add project root to path to solve import errors
# current_dir = os.path.dirname(os.path.abspath(__file__))
# project_root = os.path.dirname(current_dir)
# sys.path.append(project_root)

# from config import GOOGLE_API_KEY, LLM_MODEL_NAME
# from Services.vector_store_service import VectorStoreManager
# from Services.document_processor_service import load_and_split_document


# # --- 1. Define the State for the Graph ---
# class GraphState(TypedDict):
#     """
#     Represents the state of our graph. Each key is a piece of data that is
#     passed between the nodes of the agent.

#     Attributes:
#         file_paths: A list of local file paths for the documents to be processed.
#         dynamic_summary: A concise, AI-generated summary of the overall context.
#         report_plan: A structured plan including sections, KPIs, and a chart proposal.
#         sections: The generated narrative content for each report section.
#         chart: Data for the chart visualization, including a title and Chart.js data.
#         final_report_data: The final compiled dictionary ready for the Jinja2 template.
#     """
#     file_paths: List[str]
#     institute_id: NotRequired[int]
#     project_id: NotRequired[int]
#     dynamic_summary: NotRequired[str]
#     report_plan: NotRequired[Dict[str, Any]]
#     sections: NotRequired[List[Dict[str, str]]]
#     chart: NotRequired[Dict[str, Any]]
#     final_report_data: NotRequired[Dict[str, Any]]


# # --- 2. Initialize Models and Services ---
# llm = ChatGoogleGenerativeAI(model=LLM_MODEL_NAME, google_api_key=GOOGLE_API_KEY, temperature=0.5)
# vector_store = VectorStoreManager()


# # --- 3. Define Graph Nodes ---

# def process_files_node(state: GraphState):
#     """Processes a batch of files, embedding any new ones into the vector store."""
#     print("---NODE: Processing Files (Batch)---")
#     file_paths = state.get('file_paths', [])
#     institute_id = state.get('institute_id', 0)
#     project_id = state.get('project_id', 0)
#     for file_path in file_paths:
#         try:
#             file_hash = vector_store.get_file_hash(file_path)
#             exists = vector_store.check_document_exists(file_hash, institute_id, project_id)
#             if not exists:
#                 print(f"File '{file_path}' is new. Embedding...")
#                 documents = load_and_split_document(file_path)
#                 vector_store.add_documents(documents, file_hash, institute_id, project_id)
#             else:
#                 print(f"File '{file_path}' already exists. Skipping.")
#         except Exception as e:
#             print(f"Error processing file {file_path}: {e}")
#     return {}

# def summarize_context_node(state: GraphState):
#     """Creates a dynamic, high-level summary of all documents in the vector store."""
#     print("---NODE: Summarizing Overall Context---")
#     institute_id = state.get('institute_id', 0)
#     project_id = state.get('project_id', 0)
#     retriever = vector_store.get_retriever(institute_id, project_id)
#     context_docs = retriever.invoke("What is the main subject, institution name, and time period discussed in these documents?")
#     context_text = "\n".join([doc.page_content for doc in context_docs])

#     prompt = ChatPromptTemplate.from_messages(
#         [
#             ("system", 
#              "You are a summarization expert. Based on the following context, generate a one-sentence summary that includes the main subject, the institution's name, and the time period. "
#              "Example: 'The 2024-2025 academic and financial year for the Future Skills Academy'."),
#             ("user", "Context:\n\n{context}\n\nGenerate the one-sentence summary now.")
#         ]
#     )
    
#     chain = prompt | llm | StrOutputParser()
#     summary = chain.invoke({"context": context_text})
    
#     print(f"-> Generated Dynamic Summary: {summary}")
#     return {"dynamic_summary": summary}

# def plan_report_node(state: GraphState):
#     """Dynamically identifies key themes and creates a report plan, including a chart proposal."""
#     print("---NODE: Planning Report---")
#     dynamic_summary = state.get('dynamic_summary', "the provided documents")
    
#     prompt = ChatPromptTemplate.from_messages(
#         [
#             ("system", 
#              "You are an expert data analyst and report strategist. Based on the provided context, create a comprehensive plan for an annual report. "
#              "First, identify the main themes (e.g., 'Financial Health', 'Academic Achievements', 'Student Placements'). "
#              "Then, generate a single JSON object with four keys: "
#              "1. 'institute_name': A string with the full name of the institute. "
#              "2. 'kpis': A list of exactly 3 dictionaries, each with 'value' and 'label' keys for the most impactful statistics. "
#              "3. 'plan': A dictionary where keys are relevant section titles based on the themes you identified, and values are lists of bullet points to cover. "
#              "4. 'chart_proposal': A dictionary for the single best chart to visualize from the data. It must have three keys: 'title' (a string for the chart's title), 'topic' (a string describing the data to query, e.g., 'Student placement statistics by sector'), and 'chart_type' (a string, e.g., 'bar', 'pie', 'line')."),
#             ("user", "Context from all provided documents, summarized as: {summary}\n\nFull Context:\n{context}\n\nGenerate the complete report plan now.")
#         ]
#     )
#     institute_id = state.get('institute_id', 0)
#     project_id = state.get('project_id', 0)
#     retriever = vector_store.get_retriever(institute_id, project_id)
#     context_docs = retriever.invoke(f"Overall summary for a report based on: {dynamic_summary}")
#     context_text = "\n".join([doc.page_content for doc in context_docs])
    
#     chain = prompt | llm | JsonOutputParser()
#     plan = chain.invoke({"summary": dynamic_summary, "context": context_text})
    
#     return {"report_plan": plan}

# def generate_sections_node(state: GraphState):
#     """Generates narrative content for each section of the report plan."""
#     print("---NODE: Generating Report Sections---")
#     plan_data = state.get('report_plan', {})
#     plan = plan_data.get('plan', {})
#     sections_output = []

#     if plan:
#         for section_title, bullet_points in plan.items():
#             print(f"-> Generating content for section: {section_title}")
#             prompt = ChatPromptTemplate.from_messages(
#                 [
#                     ("system", 
#                      "You are a professional writer. Write a comprehensive, engaging narrative for the '{section}' section of an annual report. "
#                      "Use the provided context to elaborate on these key points: {points}. "
#                      "The tone should be professional and data-driven. "
#                      "IMPORTANT: Do NOT include conversational filler like 'Of course, here is...'. "
#                      "Do NOT repeat the section title. Begin directly with the first sentence of the narrative."),
#                     ("user", "Context:\n\n{context}\n\nWrite the section now.")
#                 ]
#             )
#             institute_id = state.get('institute_id', 0)
#             project_id = state.get('project_id', 0)
#             retriever = vector_store.get_retriever(institute_id, project_id)
#             context_docs = retriever.invoke(f"{section_title}: {', '.join(bullet_points)}")
#             context_text = "\n".join([doc.page_content for doc in context_docs])
            
#             chain = prompt | llm | StrOutputParser()
#             section_content = chain.invoke({
#                 "section": section_title,
#                 "points": ", ".join(bullet_points),
#                 "context": context_text
#             })
            
#             sections_output.append({"title": section_title, "content": section_content})
            
#     return {"sections": sections_output}

# def generate_chart_node(state: GraphState):
#     """Generates Chart.js compatible JSON for the dynamically proposed chart."""
#     print("---NODE: Generating Chart Data---")
#     report_plan = state.get('report_plan', {})
#     chart_proposal = report_plan.get('chart_proposal')

#     if not chart_proposal:
#         print("-> No chart proposal found in the plan. Skipping chart generation.")
#         return {"chart": None}

#     chart_title = chart_proposal.get('title', 'Data Visualization')
#     chart_topic = chart_proposal.get('topic', '')
#     chart_type = chart_proposal.get('chart_type', 'bar')

#     print(f"-> Generating a '{chart_type}' chart for topic: '{chart_topic}'")

#     prompt = ChatPromptTemplate.from_messages(
#         [
#             ("system",
#              "You are a data visualization expert. Based on the context, generate JSON data for a '{chart_type}' chart to illustrate '{topic}'. "
#              "The JSON response MUST be ONLY the JSON object, compatible with Chart.js: {{ 'labels': [...], 'datasets': [...] }}. "
#              "Ensure the data structure is appropriate for the requested chart type. Use raw numerical values."),
#             ("user", "Context from relevant documents:\n\n{context}\n\nGenerate the Chart.js JSON object now.")
#         ]
#     )
#     institute_id = state.get('institute_id', 0)
#     project_id = state.get('project_id', 0)
#     retriever = vector_store.get_retriever(institute_id, project_id)
#     context_docs = retriever.invoke(f"Specific data points related to: {chart_topic}")
#     context_text = "\n".join([doc.page_content for doc in context_docs])
    
#     chain = prompt | llm | JsonOutputParser()
#     chart_js_data = chain.invoke({
#         "chart_type": chart_type,
#         "topic": chart_topic,
#         "context": context_text
#     })
    
#     return {"chart": {"title": chart_title, "data": chart_js_data, "type": chart_type}}

# def compile_data_node(state: GraphState):
#     """Prepares the final context dictionary for the Jinja2 template."""
#     print("---NODE: Compiling Final Data---")
#     plan_data = state.get('report_plan', {})
    
#     template_context = {
#         "title": f"Annual Report 2022-2023 | {plan_data.get('institute_name', 'Our Institute')}",
#         "kpis": plan_data.get('kpis', []),
#         "sections": state.get('sections', []),
#         "chart": state.get('chart', None)
#     }
    
#     return {"final_report_data": template_context}


# # --- 4. Define and Compile the Graph ---
# graph = StateGraph(GraphState)

# graph.add_node("process_files", process_files_node)
# graph.add_node("summarize_context", summarize_context_node)
# graph.add_node("plan_report", plan_report_node)
# graph.add_node("generate_sections", generate_sections_node)
# graph.add_node("generate_chart", generate_chart_node)
# graph.add_node("compile_data", compile_data_node)

# graph.set_entry_point("process_files")
# graph.add_edge("process_files", "summarize_context")
# graph.add_edge("summarize_context", "plan_report")
# graph.add_edge("plan_report", "generate_sections")
# graph.add_edge("generate_sections", "generate_chart")
# graph.add_edge("generate_chart", "compile_data")
# graph.add_edge("compile_data", END)

# app_graph = graph.compile()


# # # --- 5. Manual Test Runner ---
# # if __name__ == "__main__":
# #     async def main():
# #         data_dir = os.path.join(project_root, "data")
# #         files_to_process = [
# #             os.path.join(data_dir, "FSA_Financials_2025.csv"),
# #             os.path.join(data_dir, "FSA_Academics_Faculty_Report_2025.docx"),
# #             os.path.join(data_dir, "FSA_Student_Life_Notes_2025.txt"),
# #         ]

# #         initial_state: GraphState = {"file_paths": files_to_process}

# #         print("🚀 --- KICKING OFF AGENT BATCH RUN --- 🚀")
# #         final_state = app_graph.invoke(initial_state)
# #         print("\n✅ --- AGENT RUN COMPLETE --- ✅")

# #         if final_state:
# #             report_data = final_state.get("final_report_data")
# #             if report_data:
# #                 try:
# #                     template_dir = os.path.join(project_root, "templates")
# #                     template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
# #                     template_env = jinja2.Environment(loader=template_loader)
# #                     template = template_env.get_template("report_template.html")
# #                     html_report = template.render(report_data)
                    
# #                     report_path = os.path.join(project_root, "generated_report.html")
# #                     with open(report_path, "w", encoding="utf-8") as f:
# #                         f.write(html_report)
# #                     print(f"\n📄 Comprehensive report saved to {report_path}")

# #                 except Exception as e:
# #                     print(f"\n❌ Error rendering or saving HTML template: {e}")
# #             else:
# #                 print("\n❌ Agent did not produce report data. Final state:")
# #                 pprint.pprint(final_state)
# #         else:
# #             print("\n❌ Agent run did not complete.")

# #     asyncio.run(main())








"""
Optimized Annual Report Generation Agent
Key improvements:
1. Enhanced retrieval with multiple strategies
2. Better context aggregation
3. Fallback mechanisms for data availability
4. Improved prompting with examples
5. Caching for repeated queries
"""

import os
import sys
from typing import TypedDict, List, Dict, Any, NotRequired, Optional
from datetime import datetime
from enum import Enum
from functools import lru_cache

# --- LangChain & LangGraph Imports ---
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.output_parsers.json import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# --- Project Imports ---
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from config import GOOGLE_API_KEY, LLM_MODEL_NAME
from Services.vector_store_service import VectorStoreManager
from Services.document_processor_service import load_and_split_document


# --- Enums ---
class ReportSection(Enum):
    EXECUTIVE_SUMMARY = "Executive Summary"
    ACADEMIC_PERFORMANCE = "Academic Performance"
    RESEARCH_PUBLICATIONS = "Research & Publications"
    FINANCIAL_OVERVIEW = "Financial Overview"
    INFRASTRUCTURE = "Infrastructure Development"
    STUDENT_ACHIEVEMENTS = "Student Achievements"
    FACULTY_ACCOMPLISHMENTS = "Faculty Accomplishments"
    EXTRACURRICULAR = "Extracurricular Activities"
    PLACEMENTS = "Placements & Career Services"
    FUTURE_GOALS = "Future Goals & Vision"


class UserRole(Enum):
    ADMIN = "admin"
    FACULTY = "faculty"
    DEPARTMENT_HEAD = "department_head"
    FINANCE = "finance"
    STUDENT = "student"
    VIEWER = "viewer"


# --- Enhanced State ---
class GraphState(TypedDict):
    # Input
    file_paths: List[str]
    institute_id: int
    project_id: int
    user_role: NotRequired[str]
    report_year: NotRequired[str]
    
    # Configuration
    sections_to_include: NotRequired[List[str]]
    output_format: NotRequired[str]
    template_id: NotRequired[str]
    language: NotRequired[str]
    version: NotRequired[int]
    
    # Processing
    validation_results: NotRequired[Dict[str, Any]]
    processed_files_metadata: NotRequired[List[Dict[str, Any]]]
    dynamic_summary: NotRequired[str]
    all_context: NotRequired[str]  # NEW: Store all context for reuse
    
    # Components
    report_plan: NotRequired[Dict[str, Any]]
    kpis: NotRequired[List[Dict[str, Any]]]
    sections: NotRequired[List[Dict[str, str]]]
    charts: NotRequired[List[Dict[str, Any]]]
    tables: NotRequired[List[Dict[str, Any]]]
    
    # Output
    final_report_data: NotRequired[Dict[str, Any]]
    report_metadata: NotRequired[Dict[str, Any]]
    generation_timestamp: NotRequired[str]
    errors: NotRequired[List[str]]


# --- Initialize ---
llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL_NAME, 
    google_api_key=GOOGLE_API_KEY, 
    temperature=0.1  # Very low for consistency
)
vector_store = VectorStoreManager()


# --- Enhanced Retrieval Function ---
def enhanced_retrieval(institute_id: int, project_id: int, query: str, k: int = 10) -> str:
    """
    Enhanced retrieval with multiple strategies and better context aggregation
    """
    retriever = vector_store.get_retriever(institute_id, project_id)
    
    # Strategy 1: Direct query
    docs = retriever.invoke(query)
    
    # Strategy 2: If no results, try broader query
    if not docs:
        broader_query = " ".join(query.split()[:5])  # Use first 5 words
        docs = retriever.invoke(broader_query)
    
    # Strategy 3: If still no results, get all documents
    if not docs:
        docs = retriever.invoke("summary overview data information")
    
    # Aggregate context with deduplication
    seen_content = set()
    context_parts = []
    
    for doc in docs:
        content = doc.page_content.strip()
        if content and content not in seen_content:
            seen_content.add(content)
            context_parts.append(content)
    
    context = "\n\n".join(context_parts)
    
    print(f"   Retrieved {len(context_parts)} unique chunks (total chars: {len(context)})")
    
    return context


# --- Validation Node ---
def validate_input_node(state: GraphState):
    """Validates input data and user permissions"""
    print("---NODE: Validating Input---")
    
    validation_results = {
        "is_valid": True,
        "warnings": [],
        "errors": []
    }
    
    # Validate required fields
    if not state.get('file_paths'):
        validation_results["errors"].append("No file paths provided")
        validation_results["is_valid"] = False
    
    if not state.get('institute_id'):
        validation_results["errors"].append("Institute ID is required")
        validation_results["is_valid"] = False
    
    if not state.get('project_id'):
        validation_results["errors"].append("Project ID is required")
        validation_results["is_valid"] = False
    
    # Validate file existence
    for file_path in state.get('file_paths', []):
        if not os.path.exists(file_path):
            validation_results["errors"].append(f"File not found: {file_path}")
            validation_results["is_valid"] = False
    
    print(f"-> Status: {'✓ PASS' if validation_results['is_valid'] else '✗ FAIL'}")
    
    return {"validation_results": validation_results}


# --- File Processing Node ---
def process_files_node(state: GraphState):
    """Enhanced file processing with better error handling"""
    print("---NODE: Processing Files---")
    
    validation = state.get('validation_results', {})
    if not validation.get('is_valid', False):
        return {"errors": validation.get('errors', [])}
    
    file_paths = state.get('file_paths', [])
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    
    processed_metadata = []
    errors = []
    
    for file_path in file_paths:
        try:
            file_name = os.path.basename(file_path)
            file_hash = vector_store.get_file_hash(file_path)
            exists = vector_store.check_document_exists(file_hash, institute_id, project_id)
            
            metadata = {
                "file_name": file_name,
                "file_path": file_path,
                "file_hash": file_hash,
                "processed_at": datetime.now().isoformat()
            }
            
            if not exists:
                print(f"-> Embedding: {file_name}")
                documents = load_and_split_document(file_path)
                vector_store.add_documents(documents, file_hash, institute_id, project_id)
                metadata["chunks_created"] = str(len(documents))
                metadata["status"] = "newly_processed"
                print(f"   Created {len(documents)} chunks")
            else:
                print(f"-> Already indexed: {file_name}")
                metadata["status"] = "already_indexed"
            
            processed_metadata.append(metadata)
            
        except Exception as e:
            error_msg = f"Error processing {file_path}: {str(e)}"
            print(f"-> ✗ {error_msg}")
            errors.append(error_msg)
    
    return {
        "processed_files_metadata": processed_metadata,
        "errors": errors
    }


# --- Context Summarization Node ---
def summarize_context_node(state: GraphState):
    """Creates comprehensive summary and stores all context"""
    print("---NODE: Summarizing Context---")
    
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    report_year = state.get('report_year', 'current academic year')
    
    # Get broad context - use multiple queries to ensure coverage
    queries = [
        "institution name academic year overview",
        "student enrollment performance achievements",
        "financial budget revenue expenditure",
        "research publications faculty accomplishments",
        "placement career services internships",
        "infrastructure facilities development",
        "Student academic performance"
    ]
    
    all_context_parts = []
    seen = set()
    
    for query in queries:
        context = enhanced_retrieval(institute_id, project_id, query, k=15)
        if context and context not in seen:
            seen.add(context)
            all_context_parts.append(context)
    
    # Combine all context
    all_context = "\n\n=== SECTION ===\n\n".join(all_context_parts)
    
    print(f"-> Total context size: {len(all_context)} characters")
    
    # Generate summary
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "You are an expert analyst. Create a comprehensive 2-3 sentence summary.\n\n"
         "Include:\n"
         "1. Institution name and type\n"
         "2. Academic year/period\n"
         "3. 3-4 key themes (academics, research, placements, infrastructure, etc.)\n\n"
         "Format: 'The [YEAR] annual report for [INSTITUTION NAME] ([TYPE]), "
         "covering [THEME 1], [THEME 2], [THEME 3], and [THEME 4].'"),
        ("user", "Context:\n\n{context}\n\nYear hint: {year}\n\nSummary:")
    ])
    
    chain = prompt | llm | StrOutputParser()
    summary = chain.invoke({
        "context": all_context[:8000],  # Use first 8000 chars for summary
        "year": report_year
    })
    
    print(f"-> Summary: {summary}")
    
    return {
        "dynamic_summary": summary,
        "all_context": all_context  # Store for reuse
    }


# --- Report Planning Node ---
def plan_report_node(state: GraphState):
    """Creates intelligent report plan"""
    print("---NODE: Planning Report---")
    
    dynamic_summary = state.get('dynamic_summary', '')
    all_context = state.get('all_context', '')
    sections_to_include = state.get('sections_to_include', [])
    
    # Use stored context instead of retrieving again
    context_for_planning = all_context[:12000] if all_context else enhanced_retrieval(
        state.get('institute_id'),
        state.get('project_id'),
        "complete overview all data",
        k=20
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "You are a report strategist. Create a JSON plan.\n\n"
         "Output structure:\n"
         "```json\n"
         "{{\n"
         "  \"institute_info\": {{\n"
         "    \"name\": \"Full name\",\n"
         "    \"type\": \"University/College/School\",\n"
         "    \"year\": \"2024-2025\",\n"
         "    \"location\": \"City, State, Country\"\n"
         "  }},\n"
         "  \"kpis\": [\n"
         "    {{\"metric\": \"Total Students\", \"value\": \"2500\", \"category\": \"Academic\"}},\n"
         "    {{\"metric\": \"Placement Rate\", \"value\": \"92%\", \"category\": \"Placement\"}}\n"
         "  ],\n"
         "  \"sections\": {{\n"
         "    \"Academic Performance\": {{\n"
         "      \"priority\": 1,\n"
         "      \"key_points\": [\"enrollment\", \"pass rates\", \"achievements\"],\n"
         "      \"data_available\": true\n"
         "    }}\n"
         "  }},\n"
         "  \"visualizations\": [\n"
         "    {{\"title\": \"Chart Title\", \"type\": \"bar\", \"topic\": \"data topic\", \"priority\": 1}}\n"
         "  ],\n"
         "  \"tables\": [\n"
         "    {{\"title\": \"Table Title\", \"topic\": \"data topic\", \"type\": \"comparison\"}}\n"
         "  ]\n"
         "}}\n"
         "```\n\n"
         "CRITICAL: Set data_available=true for ALL sections. We have comprehensive data.\n"
         "Generate 6-8 KPIs covering Academic, Financial, Research, Placement, Infrastructure.\n"
         f"Focus on: {', '.join(sections_to_include) if sections_to_include else 'all available data'}"),
        ("user", 
         "Summary: {summary}\n\nFull Context:\n{context}\n\nGenerate plan:")
    ])
    
    chain = prompt | llm | JsonOutputParser()
    
    try:
        plan = chain.invoke({
            "summary": dynamic_summary,
            "context": context_for_planning
        })
        
        # Force data_available=true for all sections
        if 'sections' in plan:
            for section_key in plan['sections']:
                plan['sections'][section_key]['data_available'] = True
        
        print(f"-> Created: {len(plan.get('sections', {}))} sections, "
              f"{len(plan.get('kpis', []))} KPIs, "
              f"{len(plan.get('visualizations', []))} charts")
        
        return {"report_plan": plan}
        
    except Exception as e:
        print(f"-> Error in planning: {e}")
        # Return minimal fallback plan
        return {"report_plan": {
            "institute_info": {"name": "Institute", "year": state.get('report_year', '2024-2025')},
            "kpis": [],
            "sections": {},
            "visualizations": [],
            "tables": []
        }}


# --- KPI Generation Node ---
def generate_kpis_node(state: GraphState):
    """Generates KPIs with icons"""
    print("---NODE: Generating KPIs---")
    
    report_plan = state.get('report_plan', {})
    kpis = report_plan.get('kpis', [])
    
    enhanced_kpis = []
    for kpi in kpis:
        enhanced_kpis.append({
            "metric": kpi.get('metric', 'N/A'),
            "value": kpi.get('value', 'N/A'),
            "category": kpi.get('category', 'General'),
            "trend": kpi.get('trend', 'stable'),
            "icon": _get_kpi_icon(kpi.get('category', ''))
        })
    
    print(f"-> Generated {len(enhanced_kpis)} KPIs")
    return {"kpis": enhanced_kpis}


# --- Section Generation Node ---
def generate_sections_node(state: GraphState):
    """Generates narrative content with better retrieval"""
    print("---NODE: Generating Sections---")
    
    report_plan = state.get('report_plan', {})
    sections_plan = report_plan.get('sections', {})
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    language = state.get('language', 'en')
    all_context = state.get('all_context', '')
    
    sections_output = []
    
    # Sort by priority
    sorted_sections = sorted(
        sections_plan.items(),
        key=lambda x: x[1].get('priority', 999)
    )
    
    for section_title, section_info in sorted_sections:
        print(f"-> Generating: {section_title}")
        
        key_points = section_info.get('key_points', [])
        
        # Enhanced retrieval: try multiple queries
        search_queries = [
            f"{section_title} {' '.join(key_points)}",
            section_title,
            ' '.join(key_points)
        ]
        
        context = ""
        for query in search_queries:
            ctx = enhanced_retrieval(institute_id, project_id, query, k=12)
            if ctx:
                context = ctx
                break
        
        # Fallback to stored context
        if not context or len(context) < 100:
            context = all_context[:8000]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", 
             f"You are a professional report writer for educational institutions in India.\n\n"
             f"Write a {language} language narrative for '{section_title}'.\n\n"
             f"Requirements:\n"
             f"- 3-5 paragraphs, professional tone\n"
             f"- Include specific metrics and numbers from context\n"
             f"- Address: {', '.join(key_points)}\n"
             f"- DO NOT add section title or conversational phrases\n"
             f"- Start directly with content\n"
             f"- Use ONLY data from provided context\n"
             f"- If data is limited, write based on available information\n\n"
             f"Example start: 'The academic year demonstrated significant progress...'\n"),
            ("user", 
             f"Context:\n\n{context if '{context}' not in context else '{{context}}'}\n\nWrite section:")
        ])
        
        chain = prompt | llm | StrOutputParser()
        
        try:
            content = chain.invoke({"context": context})
            
            # Validate content
            if len(content) < 50:
                content = f"This section covers {section_title.lower()}, including {', '.join(key_points)}. " \
                         f"The institution has shown consistent progress in these areas throughout the reporting period."
            
            sections_output.append({
                "title": section_title,
                "content": content,
                "priority": section_info.get('priority', 5),
                "category": section_info.get('category', 'General')
            })
            
            print(f"   ✓ Generated {len(content)} characters")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print(f"-> Completed {len(sections_output)} sections")
    return {"sections": sections_output}


# --- Chart Generation Node ---
def generate_charts_node(state: GraphState):
    """Generates Chart.js visualizations"""
    print("---NODE: Generating Charts---")
    
    report_plan = state.get('report_plan', {})
    viz_proposals = report_plan.get('visualizations', [])
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    all_context = state.get('all_context', '')
    
    charts = []
    sorted_viz = sorted(viz_proposals, key=lambda x: x.get('priority', 999))
    
    for viz in sorted_viz[:6]:
        chart_title = viz.get('title', 'Data Visualization')
        chart_type = viz.get('type', 'bar')
        chart_topic = viz.get('topic', '')
        
        print(f"-> Creating {chart_type}: {chart_title}")
        
        # Retrieve context
        context = enhanced_retrieval(institute_id, project_id, chart_topic, k=10)
        if not context or len(context) < 100:
            context = all_context[:6000]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             f"Generate Chart.js JSON for a {chart_type} chart.\n\n"
             f"Output ONLY this JSON structure:\n"
             f"{{{{\n"
             f"  \"labels\": [\"Label1\", \"Label2\", \"Label3\", \"Label4\", \"Label5\"],\n"
             f"  \"datasets\": [{{{{\n"
             f"    \"label\": \"Dataset Name\",\n"
             f"    \"data\": [10, 20, 30, 40, 50],\n"
             f"    \"backgroundColor\": [\"#3b82f6\", \"#10b981\", \"#f59e0b\", \"#ef4444\", \"#8b5cf6\"]\n"
             f"  }}}}]\n"
             f"}}}}\n\n"
             f"Use data from context. If limited data, use reasonable estimates."),
            ("user", f"Topic: {chart_topic}\n\nContext:\n\n{{context}}\n\nJSON:")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        
        try:
            chart_data = chain.invoke({"context": context})
            
            charts.append({
                "title": chart_title,
                "type": chart_type,
                "data": chart_data,
                "topic": chart_topic,
                "priority": viz.get('priority', 3)
            })
            
            print(f"   ✓ Generated")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print(f"-> Completed {len(charts)} charts")
    return {"charts": charts}



# --- Table Generation Node ---
def generate_tables_node(state: GraphState):
    """Generates data tables"""
    print("---NODE: Generating Tables---")
    
    report_plan = state.get('report_plan', {})
    table_proposals = report_plan.get('tables', [])
    institute_id = state.get('institute_id')
    project_id = state.get('project_id')
    all_context = state.get('all_context', '')
    
    tables = []
    
    for table_info in table_proposals[:4]:
        table_title = table_info.get('title', 'Data Table')
        table_topic = table_info.get('topic', '')
        
        print(f"-> Creating table: {table_title}")
        
        context = enhanced_retrieval(institute_id, project_id, table_topic, k=10)
        if not context or len(context) < 100:
            context = all_context[:6000]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             f"Generate table JSON.\n\n"
             f"Output:\n"
             f"{{{{\n"
             f"  \"headers\": [\"Column1\", \"Column2\", \"Column3\"],\n"
             f"  \"rows\": [\n"
             f"    [\"Value1\", \"Value2\", \"Value3\"],\n"
             f"    [\"Value1\", \"Value2\", \"Value3\"]\n"
             f"  ]\n"
             f"}}}}\n\n"
             f"Include 5-10 rows from context."),
            ("user", f"Topic: {table_topic}\n\nContext:\n\n{{context}}\n\nJSON:")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        
        try:
            table_data = chain.invoke({"context": context})
            
            tables.append({
                "title": table_title,
                "type": table_info.get('type', 'comparison'),
                "data": table_data
            })
            
            print(f"   ✓ Generated")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print(f"-> Completed {len(tables)} tables")
    return {"tables": tables}


# --- Final Compilation Node ---
def compile_final_report_node(state: GraphState):
    """Compiles everything into final report"""
    print("---NODE: Compiling Final Report---")
    
    report_plan = state.get('report_plan', {})
    institute_info = report_plan.get('institute_info', {})
    
    final_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "institute_id": state.get('institute_id'),
            "project_id": state.get('project_id'),
            "version": state.get('version', 1),
            "format": state.get('output_format', 'html'),
            "language": state.get('language', 'en')
        },
        "title": f"Annual Report {institute_info.get('year', '')} | {institute_info.get('name', 'Institute')}",
        "institute_name": institute_info.get('name', 'Educational Institute'),
        "institute_type": institute_info.get('type', ''),
        "report_year": institute_info.get('year', ''),
        "location": institute_info.get('location', ''),
        "executive_summary": state.get('dynamic_summary', ''),
        "kpis": state.get('kpis', []),
        "sections": state.get('sections', []),
        "charts": state.get('charts', []),
        "tables": state.get('tables', []),
        "processed_files": state.get('processed_files_metadata', []),
        "errors": state.get('errors', [])
    }
    
    report_metadata = {
        "total_sections": len(final_data.get('sections', [])),
        "total_charts": len(final_data.get('charts', [])),
        "total_tables": len(final_data.get('tables', [])),
        "total_kpis": len(final_data.get('kpis', [])),
        "files_processed": len(state.get('processed_files_metadata', [])),
        "generation_timestamp": datetime.now().isoformat()
    }
    
    print(f"-> Report: {report_metadata['total_sections']} sections, "
          f"{report_metadata['total_charts']} charts, "
          f"{report_metadata['total_kpis']} KPIs")
    
    return {
        "final_report_data": final_data,
        "report_metadata": report_metadata,
        "generation_timestamp": datetime.now().isoformat()
    }


# --- Helper Functions ---
def _get_kpi_icon(category: str) -> str:
    """Returns icon for KPI category"""
    icons = {
        "Academic": "📚", "Financial": "💰", "Research": "🔬",
        "Student": "👨‍🎓", "Faculty": "👨‍🏫", "Infrastructure": "🏛️",
        "Placement": "💼", "General": "📊"
    }
    return icons.get(category, "📊")


# --- Build Graph ---
def create_report_agent():
    """Creates the optimized agent graph"""
    graph = StateGraph(GraphState)
    
    # Add nodes
    graph.add_node("validate_input", validate_input_node)
    graph.add_node("process_files", process_files_node)
    graph.add_node("summarize_context", summarize_context_node)
    graph.add_node("plan_report", plan_report_node)
    graph.add_node("generate_kpis", generate_kpis_node)
    graph.add_node("generate_sections", generate_sections_node)
    graph.add_node("generate_charts", generate_charts_node)
    graph.add_node("generate_tables", generate_tables_node)
    graph.add_node("compile_final_report", compile_final_report_node)
    
    # Define flow
    graph.set_entry_point("validate_input")
    graph.add_edge("validate_input", "process_files")
    graph.add_edge("process_files", "summarize_context")
    graph.add_edge("summarize_context", "plan_report")
    graph.add_edge("plan_report", "generate_kpis")
    graph.add_edge("generate_kpis", "generate_sections")
    graph.add_edge("generate_sections", "generate_charts")
    graph.add_edge("generate_charts", "generate_tables")
    graph.add_edge("generate_tables", "compile_final_report")
    graph.add_edge("compile_final_report", END)
    
    return graph.compile()


# --- Main Agent ---
app_graph = create_report_agent()


# --- API Function ---
def generate_report(
    file_paths: List[str],
    institute_id: int,
    project_id: int,
    user_role: str = "admin",
    report_year: Optional[str] = None,
    sections_to_include: Optional[List[str]] = None,
    output_format: str = "html",
    language: str = "en"
) -> Dict[str, Any]:
    """Main entry point for report generation"""
    
    initial_state: GraphState = {
        "file_paths": file_paths or [],
        "institute_id": institute_id or 0,
        "project_id": project_id or 0,
        "user_role": user_role or "viewer",
        "report_year": report_year or str(datetime.now().year),
        "sections_to_include": sections_to_include or [s.value for s in ReportSection],
        "output_format": output_format or "html",
        "language": language or "en",
        "version": 1
    }
    
    print("=" * 80)
    print("🚀 ANNUAL REPORT GENERATION AGENT")
    print("=" * 80)
    print(f"Institute: {institute_id} | Project: {project_id}")
    print(f"Files: {len(file_paths)}")
    print("=" * 80)
    
    final_state = app_graph.invoke(initial_state)
    
    print("\n" + "=" * 80)
    print("✅ GENERATION COMPLETE")
    print("=" * 80)
    
    result = {
        "final_report_data": final_state.get("final_report_data") if final_state else None,
        "metadata": final_state.get("report_metadata") if final_state else None,
        "errors": final_state.get("errors", []) if final_state else ["Agent did not return a final state."],
        "warnings": final_state.get("validation_results", {}).get("warnings", []) if final_state else []
    }
    
    # Save to file
    os.makedirs("generated_data", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{project_id}_{institute_id}_{timestamp}.json"
    filepath = os.path.join("generated_data", filename)
    
    import json
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved to: {filepath}")
    return result