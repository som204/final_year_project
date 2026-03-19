// src/components/Pricing.jsx
import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
  const tiers = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for small departments getting started.',
      features: ['Up to 5 Users', 'Basic Reports (PDF)', 'Standard KPI Tracking', 'Community Support'],
      buttonText: 'Get Started',
      buttonVariant: 'outline'
    },
    {
      name: 'Professional',
      price: '$199',
      period: '/month',
      description: 'Ideal for entire institutes needing robust analytics.',
      features: ['Unlimited Users', 'Advanced Custom Dashboards', 'API Data Integration', 'Priority 24/7 Support', 'Custom Report Templates'],
      buttonText: 'Start Free Trial',
      buttonVariant: 'solid',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For university systems requiring large-scale deployments.',
      features: ['Multi-Campus Management', 'On-Premise Deployment Option', 'Dedicated Success Manager', 'White-labeling', 'Advanced Security Logging'],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline'
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase mb-3">Pricing</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">Simple, Transparent Pricing</h3>
          <p className="text-lg text-slate-600 font-light">
            Choose the perfect plan that fits your institute's reporting needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <div key={index} className={`relative flex flex-col p-8 rounded-3xl ${tier.popular ? 'bg-indigo-900 text-white shadow-2xl scale-105 border-2 border-indigo-500 z-10' : 'bg-white text-slate-900 border border-slate-200 shadow-lg z-0'} transition-transform duration-300 hover:-translate-y-2`}>
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-indigo-500 to-violet-500 text-white px-4 py-1 text-sm font-bold uppercase rounded-full shadow-md tracking-wider">
                  Most Popular
                </div>
              )}
              <h4 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-indigo-200' : 'text-slate-900'}`}>{tier.name}</h4>
              <p className={`mb-6 text-sm grow ${tier.popular ? 'text-indigo-100' : 'text-slate-500'}`}>{tier.description}</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold">{tier.price}</span>
                {tier.period && <span className={`text-lg font-medium ${tier.popular ? 'text-indigo-200' : 'text-slate-500'}`}>{tier.period}</span>}
              </div>
              <ul className="mb-8 space-y-4 grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${tier.popular ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={tier.popular ? 'text-indigo-50' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-xl ${
                tier.popular 
                  ? 'bg-white text-indigo-900 hover:bg-slate-100 hover:-translate-y-1' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:-translate-y-1'
              }`}>
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
