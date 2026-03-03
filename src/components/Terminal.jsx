import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTerminal } from '../hooks/useTerminal';
import { useServers } from '../hooks/useServers';
import { ArrowLeft, Play, Square, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import api from '../services/api';
import '@xterm/xterm/css/xterm.css';
import '../styles/components.css';

const Terminal = () => {
    const { serverId, userId } = useParams();
    const navigate = useNavigate();

    // Hooks personalizados
    const { getServerById } = useServers();
    const { connectWebSocket, disconnectWebSocket, sendCommand, sendResize } = useTerminal(serverId, userId);
    
    const [server, setServer] = useState(null);
    const [user, setUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isTerminalReady, setIsTerminalReady] = useState(false);
    
    // Referencias
    const terminalRef = useRef(null); // Referencia al contenedor
    const xtermRef = useRef(null); // Objeto de terminal XTerm
    const fitAddonRef = useRef(null); // Referencia para tamaño del terminal
    const onDataDisposableRef = useRef(null); // Guardar comando

    // Cargar datos del servidor y usuario
    const loadServerAndUser = useCallback(async () => {
        try {
            const serverData = await getServerById(serverId);
            setServer(serverData);
            
            let userData = null;
            if (userId) {
                try {
                    const userResponse = await api.get(`/server-users/${userId}/`);
                    userData = userResponse.data;
                } catch (err) {
                    const fallbackUser = serverData?.users?.find(
                        (candidate) => String(candidate.id) === String(userId)
                    );
                    if (fallbackUser) {
                        userData = fallbackUser;
                    }
                }
            }
            setUser(userData);
        } catch (err) {
            console.error("Error al cargar datos del servidor o usuario:", err);
        }
    }, [serverId, userId, getServerById]);

    // Configurar terminal
    const setupTerminal = useCallback(() => {
        if (!server || !terminalRef.current || xtermRef.current) return;
        const screenWidth = window.innerWidth;
        let terminalFontSize;
        
        if (screenWidth <= 480) {
            // sm (Teléfono)
            terminalFontSize = 11;
        } else if (screenWidth <= 768) {
            // md (Tablet)
            terminalFontSize = 12;
        } else {
            // lg (Escritorio)
            terminalFontSize = 14;
        }

        // Inicializar XTerm
        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#f0f0f0',
                cursor: '#f0f0f0',
                selectionBackground: '#4d4d4d',
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: terminalFontSize,
        });
        
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(terminalRef.current);
        fitAddon.fit();
        
        xtermRef.current = term;
        fitAddonRef.current = fitAddon;
        setIsTerminalReady(true);

        // Redimensionamiento de ventana
        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
                if (xtermRef.current) {
                    const { cols, rows } = xtermRef.current;
                    sendResize(cols, rows);
                }
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
            xtermRef.current = null;
            disconnectWebSocket();
            setIsTerminalReady(false);
        };
    }, [server, sendResize, disconnectWebSocket]);

    // Carga de datos
    useEffect(() => {
        loadServerAndUser();
    }, [loadServerAndUser]);

    // Inicializar terminal
    useEffect(() => {
        const cleanup = setupTerminal();
        return cleanup;
    }, [setupTerminal]);


    // Iniciar conexión WebSocket
    const handleConnect = () => {
        if (!serverId || !userId || isConnected || !xtermRef.current) return;

        xtermRef.current.clear();
        xtermRef.current.writeln('\x1b[36mConectando al servidor...\x1b[0m');

        // Callback para recibir datos del socket -> escribir en terminal
        const ws = connectWebSocket((data) => {
            if (xtermRef.current) {
                xtermRef.current.write(data);
            }
        });

        if (ws) {
            // Conexión establecida
            ws.addEventListener('open', () => {
                setIsConnected(true);
                if (fitAddonRef.current && xtermRef.current) {
                    fitAddonRef.current.fit();
                    const { cols, rows } = xtermRef.current;
                    sendResize(cols, rows);
                }
            });

            // impiar estado y eventos
            ws.addEventListener('close', () => {
                setIsConnected(false);
                if (onDataDisposableRef.current) {
                    onDataDisposableRef.current.dispose();
                    onDataDisposableRef.current = null;
                }
            });

            // Input terminal -> Enviar al socket
            if (onDataDisposableRef.current) {
                onDataDisposableRef.current.dispose();
            }

            onDataDisposableRef.current = xtermRef.current.onData((data) => {
                // Enviar comando al backend
                sendCommand(data);
            });
        }
    };

    // Manejar desconexión
    const handleDisconnect = () => {
        disconnectWebSocket();
        setIsConnected(false);
        if (onDataDisposableRef.current) {
            onDataDisposableRef.current.dispose();
            onDataDisposableRef.current = null;
        }
        if (xtermRef.current) {
            xtermRef.current.write('\r\n');
            xtermRef.current.write('\r\n');
            xtermRef.current.writeln('\x1b[33mDesconectado servidor...\x1b[0m');
            xtermRef.current.write('\r\n');
        }
    };

    if (!server) return <LoadingSpinner message="Cargando terminal..." />;

    return (
        <div className="terminal-page">
            <div className="terminal-page__header">
                <button onClick={() => navigate(-1)} className="terminal-page__back-btn" title="Volver">
                    <ArrowLeft size={18} />
                </button>
                <div className="terminal-page__divider" aria-hidden="true"></div>
                
                <div className="terminal-page__info">
                    <div className="terminal-page__title-section">
                        <div className="terminal-page__title-content">
                            <h1 className="terminal-page__title">{server.name}</h1>
                            <div className="terminal-page__details">
                                <span 
                                    className="terminal-page__detail terminal-page__detail--clickable"
                                    onClick={() => navigate(`/servers/${serverId}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/servers/${serverId}`)}
                                >
                                    <strong>IP:</strong> {server.ip} <ExternalLink size={12} />
                                </span>
                                <span className="terminal-page__detail">
                                    <strong>Usuario:</strong> {user?.username || `ID ${userId}`}
                                </span>
                                <span className="terminal-page__detail">
                                    <strong>Estado:</strong>
                                    {isConnected ? (
                                        <><Wifi size={14} className="terminal-page__status-icon terminal-page__status-icon--connected" /> Conectado</>
                                    ) : (
                                        <><WifiOff size={14} className="terminal-page__status-icon terminal-page__status-icon--disconnected" /> Desconectado</>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="terminal-page__actions">
                    {!isConnected ? (
                        <button 
                            className="btn btn--primary terminal-page__btn-connect" 
                            onClick={handleConnect}
                            disabled={!isTerminalReady}
                        >
                            <Play size={16} /> Conectar
                        </button>
                    ) : (
                        <button 
                            className="btn terminal-page__btn-disconnect" 
                            onClick={handleDisconnect}
                        >
                            <Square size={16} /> Desconectar
                        </button>
                    )}
                </div>
            </div>

            <div className="terminal">
                <div 
                    ref={terminalRef} 
                    className="terminal__xterm"
                ></div>
            </div>
        </div>
    );
};

export default Terminal;
