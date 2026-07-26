"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { HunterCard } from "./hunter-card";
import { HunterButton } from "./hunter-button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class HunterErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("System Boundary Error Caught:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-mono">
                    <HunterCard variant="system" className="border-red-500/50 bg-red-950/20 max-w-md w-full">
                        <div className="p-6 text-center space-y-4">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                            <h2 className="text-xl font-black italic tracking-tighter text-red-400 uppercase">
                                SYSTEM ANOMALY DETECTED
                            </h2>
                            <p className="text-xs text-zinc-400 italic leading-relaxed">
                                {this.state.error?.message || "An unexpected system malfunction occurred."}
                            </p>
                            <HunterButton 
                                onClick={this.handleReset}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> REBOOT SYSTEM
                            </HunterButton>
                        </div>
                    </HunterCard>
                </div>
            );
        }

        return this.props.children;
    }
}
