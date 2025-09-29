import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIBotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIBotState {
  isActive: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  messages: AIBotMessage[];
  connectionAttempts: number;
}

const MAX_RECONNECTION_ATTEMPTS = 3;
const RECONNECTION_DELAY = 2000;

export const useAIBot = (user: User | null) => {
  const { toast } = useToast();
  const [state, setState] = useState<AIBotState>({
    isActive: false,
    isConnected: false,
    isLoading: false,
    error: null,
    messages: [],
    connectionAttempts: 0,
  });

  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Bot initialization with comprehensive error handling
  const initializeBot = useCallback(async () => {
    if (!user || initializationRef.current) {
      console.log('AI Bot: Skipping initialization - no user or already initializing');
      return;
    }

    initializationRef.current = true;
    console.log('AI Bot: Starting initialization for user:', user.id);

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      connectionAttempts: prev.connectionAttempts + 1
    }));

    try {
      // Test Supabase connection
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (testError) {
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      // Simulate AI service initialization
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Test edge function availability (if AI chat function exists)
      try {
        const { error: functionError } = await supabase.functions.invoke('ai-chat', {
          body: { test: true }
        });
        
        if (functionError && !functionError.message.includes('Not Found')) {
          console.warn('AI function test warning:', functionError.message);
        }
      } catch (err) {
        console.log('AI function not available, using local processing');
      }

      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isLoading: false,
        error: null,
        connectionAttempts: 0
      }));

      console.log('AI Bot: Successfully initialized');
      
      toast({
        title: "AI Assistant Ready",
        description: "Your AI assistant is now available",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('AI Bot initialization failed:', errorMessage);
      
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false,
        error: errorMessage
      }));

      // Attempt reconnection if within limits
      if (state.connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
        console.log(`AI Bot: Scheduling reconnection attempt ${state.connectionAttempts + 1}`);
        reconnectionTimeoutRef.current = setTimeout(() => {
          initializationRef.current = false;
          initializeBot();
        }, RECONNECTION_DELAY * state.connectionAttempts);
      } else {
        toast({
          title: "AI Assistant Unavailable",
          description: "Unable to connect to AI services. Some features may be limited.",
          variant: "destructive",
        });
      }
    } finally {
      initializationRef.current = false;
    }
  }, [user, state.connectionAttempts, toast]);

  // Initialize bot when user changes or component mounts
  useEffect(() => {
    if (user && !state.isConnected && !state.isLoading) {
      console.log('AI Bot: User authenticated, initializing bot');
      initializeBot();
    } else if (!user) {
      console.log('AI Bot: User signed out, disconnecting bot');
      setState({
        isActive: false,
        isConnected: false,
        isLoading: false,
        error: null,
        messages: [],
        connectionAttempts: 0,
      });
      initializationRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current);
      }
    };
  }, [user, initializeBot, state.isConnected, state.isLoading]);

  // Monitor authentication state changes
  useEffect(() => {
    console.log('AI Bot state change:', {
      userExists: !!user,
      isConnected: state.isConnected,
      isLoading: state.isLoading,
      error: state.error,
      attempts: state.connectionAttempts
    });
  }, [user, state]);

  const activateBot = useCallback(() => {
    if (!state.isConnected) {
      toast({
        title: "AI Assistant Not Ready",
        description: "Please wait for the AI assistant to initialize",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isActive: true }));
    console.log('AI Bot: Activated');
  }, [state.isConnected, toast]);

  const deactivateBot = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
    console.log('AI Bot: Deactivated');
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.isConnected || !user) {
      console.error('AI Bot: Cannot send message - not connected or no user');
      return;
    }

    const userMessage: AIBotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    try {
      // Simulate AI response (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const botMessage: AIBotMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `I understand you said: "${content}". How can I help you with that?`,
        timestamp: new Date(),
      };

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('AI Bot: Message failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Message Failed",
        description: "Unable to send message to AI assistant",
        variant: "destructive",
      });
    }
  }, [state.isConnected, user, toast]);

  const retryConnection = useCallback(() => {
    setState(prev => ({ ...prev, connectionAttempts: 0, error: null }));
    initializationRef.current = false;
    initializeBot();
  }, [initializeBot]);

  return {
    isActive: state.isActive,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    messages: state.messages,
    connectionAttempts: state.connectionAttempts,
    activateBot,
    deactivateBot,
    sendMessage,
    retryConnection,
  };
};