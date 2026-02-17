import React from 'react';
import { subscriptionPlans } from '@/data/mockData';
import { Check, Star } from 'lucide-react';

const Subscription: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose the plan that works best for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-card hover-lift p-6 relative ${
              plan.highlighted ? 'ring-2 ring-primary' : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" /> Popular
              </div>
            )}

            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">${plan.price}</span>
              <span className="text-sm text-muted-foreground">/{plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                plan.highlighted
                  ? 'gradient-primary text-primary-foreground hover:opacity-90'
                  : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              {plan.highlighted ? 'Upgrade to Premium' : 'Current Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
