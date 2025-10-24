import React from 'react';
import { AppIconBlack } from './AppIconBlack';

export const ListeningLoader: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center animate-fade-in -z-10">
            <div className="loader-inner">
                <div className="loader-logo">
                    <AppIconBlack />
                </div>
                <div className="box"></div>
                <div className="box"></div>
                <div className="box"></div>
                <div className="box"></div>
                <div className="box"></div>
            </div>
            <style>{`
                .loader-inner {
                    position: relative;
                    height: 250px;
                    width: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .loader-logo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999;
                    animation: logo-pulse 2s infinite ease-in-out;
                }
                .loader-inner .box {
                    position: absolute;
                    background: linear-gradient(0deg, rgba(20,20,20,.2) 0%, rgba(50,50,50,.2) 100%);
                    border-radius: 50%;
                    border-top: 1px solid rgb(100, 100, 100);
                    backdrop-filter: blur(5px);
                    animation: ripple 2s infinite ease-in-out;
                }
                .loader-inner .box:nth-of-type(1) { width: 25%; aspect-ratio: 1/1; z-index: 99; }
                .loader-inner .box:nth-of-type(2) { inset: 30%; z-index: 98; border-color: rgba(100, 100, 100, .8); animation-delay: .2s; }
                
                /* Apply glow animation only to the outer 3 rings */
                .loader-inner .box:nth-of-type(3),
                .loader-inner .box:nth-of-type(4),
                .loader-inner .box:nth-of-type(5) {
                    animation-name: ripple-glow;
                }
                .loader-inner .box:nth-of-type(3) { inset: 20%; z-index: 97; border-color: rgba(100, 100, 100, .6); animation-delay: .4s; }
                .loader-inner .box:nth-of-type(4) { inset: 10%; z-index: 96; border-color: rgba(100, 100, 100, .4); animation-delay: .6s; }
                .loader-inner .box:nth-of-type(5) { inset: 0; z-index: 95; border-color: rgba(100, 100, 100, .2); animation-delay: .8s; }
                
                @keyframes logo-pulse {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.3); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }

                @keyframes ripple {
                    0% { transform: scale(1); box-shadow: rgba(0, 0, 0, .3) 0 10px 10px 0; }
                    50% { transform: scale(1.3); box-shadow: rgba(0, 0, 0, .3) 0 30px 20px 0; }
                    100% { transform: scale(1); box-shadow: rgba(0, 0, 0, .3) 0 10px 10px 0; }
                }

                @keyframes ripple-glow {
                    0% {
                        transform: scale(1);
                        box-shadow: rgba(0, 0, 0, .3) 0 10px 10px 0, 0 0 5px 1px rgba(220, 38, 38, 0.1);
                    }
                    50% {
                        transform: scale(1.3);
                        box-shadow: rgba(0, 0, 0, .3) 0 30px 20px 0, 0 0 15px 4px rgba(249, 115, 22, 0.2);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: rgba(0, 0, 0, .3) 0 10px 10px 0, 0 0 5px 1px rgba(220, 38, 38, 0.1);
                    }
                }
            `}</style>
        </div>
    );
};