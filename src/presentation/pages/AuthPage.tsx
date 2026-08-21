import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { BookOpen, Sparkles } from 'lucide-react';
import { supabase } from '../../infrastructure/supabase/client';

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] flex flex-col justify-center items-center px-4 py-8 antialiased selection:bg-[#B0BEA9]/30">
      
      {/* Container Centrale Form Login/Registrazione */}
      <div className="w-full max-w-md bg-[#F7F4EE] dark:bg-[#201E1C] p-6 sm:p-8 rounded-3xl border border-[#E2DDD2] dark:border-[#383430] shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow ambientale di sfondo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#5C6B55]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header App */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5C6B55] text-white flex items-center justify-center shadow-md">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2E332B] dark:text-[#ECE7DE] tracking-tight">
              BiblioDesk
            </h1>
            <p className="text-xs text-[#7A756D] dark:text-[#9E988F] font-medium flex items-center justify-center gap-1">
              <Sparkles size={12} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
              La tua libreria digitale e social di lettura
            </p>
          </div>
        </div>

        {/* Form Supabase Auth UI */}
        <div className="relative z-10 pt-2">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#5C6B55',
                    brandAccent: '#475441',
                    inputBackground: 'transparent',
                    inputText: 'inherit',
                    inputBorder: '#E2DDD2'
                  },
                  radii: {
                    borderRadiusButton: '1rem',
                    buttonBorderRadius: '1rem',
                    inputBorderRadius: '0.875rem'
                  }
                }
              }
            }}
            providers={['google', 'github']}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Indirizzo Email',
                  password_label: 'Password',
                  button_label: 'Accedi',
                  loading_button_label: 'Accesso in corso...',
                  social_provider_text: 'Accedi con {{provider}}',
                  link_text: 'Hai già un account? Accedi'
                },
                sign_up: {
                  email_label: 'Indirizzo Email',
                  password_label: 'Password',
                  button_label: 'Registrati',
                  loading_button_label: 'Registrazione in corso...',
                  social_provider_text: 'Registrati con {{provider}}',
                  link_text: 'Non hai un account? Registrati'
                },
                forgotten_password: {
                  email_label: 'Indirizzo Email',
                  button_label: 'Invia istruzioni di recupero',
                  link_text: 'Password dimenticata?'
                }
              }
            }}
          />
        </div>

      </div>
    </div>
  );
};
