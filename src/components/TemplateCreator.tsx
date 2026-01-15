import React, { useState, useRef } from 'react';

interface TemplateCreatorProps {
    onClose: () => void;
}

interface ChatStepMessage {
    role: 'user' | 'assistant';
    content: string;
}

const TemplateCreator: React.FC<TemplateCreatorProps> = ({ onClose }) => {
    // Form State
    const [showInstructions, setShowInstructions] = useState(true);
    const [charName, setCharName] = useState('');
    const [charDescription, setCharDescription] = useState(''); // System Prompt
    const [introText, setIntroText] = useState(''); // Intro Popup
    const [profilePic, setProfilePic] = useState<string | null>(null);

    // Chat Simulation State
    const [chatMessages, setChatMessages] = useState<ChatStepMessage[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentRole, setCurrentRole] = useState<'user' | 'assistant'>('user');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = () => {
        if (!currentInput.trim()) return;

        // Remove strict 12 limit, maybe set a high sanity cap if needed, or open ended
        // The user said "let me add more messages... but at least 12".
        if (chatMessages.length >= 100) {
            alert("Maximum 100 Nachrichten erreicht. Das ist eine Menge Chat!");
            return;
        }

        setChatMessages([...chatMessages, { role: currentRole, content: currentInput }]);
        setCurrentInput('');
        // Auto-switch role for convenience, but allow manual toggle
        setCurrentRole(prev => prev === 'user' ? 'assistant' : 'user');
    };

    const handleSubmit = async () => {
        if (!charName || !charDescription) {
            alert("Bitte fülle Name und Beschreibung aus.");
            return;
        }

        if (chatMessages.length < 12) {
            alert(`Bitte füge mindestens 12 Chat-Nachrichten hinzu damit genug Kontext da ist (aktuell ${chatMessages.length}/12).`);
            return;
        }


        setIsSubmitting(true);
        setStatusMessage("Speichere Szenario...");

        const templateData = {
            name: charName,
            systemPrompt: charDescription,
            introText: introText,
            avatar: profilePic, // Base64 string
            messages: chatMessages,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/save_template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            if (response.ok) {
                setStatusMessage("Szenario erfolgreich gespeichert! (Check server logs)");
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                const errorData = await response.json();
                setStatusMessage(`Fehler: ${errorData.error || 'Unbekannter Fehler'}`);
            }
        } catch (error: any) {
            setStatusMessage(`Fehler: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000', // Deep black background
            backgroundImage: 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)',
            zIndex: 2000,
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            overflowY: 'auto',
            padding: '40px'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Neues Szenario erstellen
                    </h1>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '24px',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                    >
                        ×
                    </button>
                </div>

            </div>

            {showInstructions ? (
                <div style={{ padding: '0 20px' }}>
                    <h2 style={{ fontSize: '20px', color: 'white', marginBottom: '10px' }}>Bevor es losgeht...</h2>
                    <p style={{ color: '#ccc', fontSize: '15px', marginBottom: '20px' }}>
                        Hier erstellst du ein neues Szenario für andere Nutzer. Bitte beachte folgendes:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: '#44ff44' }}>●</span>
                            <div>
                                <strong style={{ color: 'white' }}>System Prompt (Charakterbeschreibung):</strong><br />
                                Beschreibe die Persönlichkeit, das Wissen und die Ziele der ROLLE genau.
                                Die KI muss wissen, wer sie ist, um glaubwürdig im Charakter zu bleiben.
                            </div>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: '#44ff44' }}>●</span>
                            <div>
                                <strong style={{ color: 'white' }}>Chat-Verlauf:</strong><br />
                                Erstelle einen realistischen Beispiel-Dialog. Dieser dient als Vorlage und Einführung
                                für andere Nutzer, damit sie die Situation und Tonalität sofort verstehen.
                            </div>
                        </li>
                    </ul>
                    <button
                        onClick={() => setShowInstructions(false)}
                        style={{
                            marginTop: '20px',
                            background: 'white',
                            color: 'black',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '30px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Verstanden, los geht's!
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                    {/* Left Column: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


                        {/* Profile Pic Upload */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: profilePic ? `url(${profilePic}) center/cover` : 'rgba(255,255,255,0.05)',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginBottom: '10px',
                                alignSelf: 'center'
                            }}
                        >
                            {!profilePic && <span style={{ fontSize: '12px', color: '#666' }}>Avatar hochladen</span>}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Name der Rolle</label>
                            <input
                                type="text"
                                value={charName}
                                onChange={(e) => setCharName(e.target.value)}
                                placeholder="z.B. Der Demo-Organisator"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Prompt</label>
                            <textarea
                                value={charDescription}
                                onChange={(e) => setCharDescription(e.target.value)}
                                placeholder="Beschreibe, wie sich die KI verhalten soll..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Intro Text</label>
                            <textarea
                                value={introText}
                                onChange={(e) => setIntroText(e.target.value)}
                                placeholder="Text, der vor dem Chat angezeigt wird..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                            />
                        </div>

                    </div>

                    {/* Right Column: Chat Simulator */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '600px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '14px', color: '#888', margin: 0 }}>Dialog-Simulator</h3>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: chatMessages.length >= 12 ? '#44ff44' : '#ff4444',
                                transition: 'color 0.3s'
                            }}>
                                {chatMessages.length}/12 Nachrichten
                            </span>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {chatMessages.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#444', marginTop: '50px', fontSize: '14px' }}>
                                    Noch keine Nachrichten. Tippe unten los.
                                </div>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.role === 'user' ? '#007AFF' : '#2A2A2A',
                                    color: 'white',
                                    padding: '10px 14px',
                                    borderRadius: '18px',
                                    maxWidth: '80%',
                                    fontSize: '14px',
                                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '18px',
                                }}>
                                    <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>{msg.role === 'user' ? 'Nutzer' : 'Charakter'}</div>
                                    {msg.content}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '40px' }}>
                            <button
                                onClick={() => setCurrentRole(prev => prev === 'user' ? 'assistant' : 'user')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: currentRole === 'user' ? '#007AFF' : '#888',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    minWidth: '60px'
                                }}
                            >
                                {currentRole === 'user' ? 'DU' : 'KI'}
                            </button>
                            <input
                                type="text"
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={`Schreibe als ${currentRole === 'user' ? 'Nutzer' : 'KI'}...`}
                                style={{
                                    flex: 1,
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={chatMessages.length >= 100}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#007AFF',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {
                !showInstructions && (
                    <div style={{ textAlign: 'right' }}>
                        {statusMessage && <span style={{ marginRight: '15px', fontSize: '14px', color: statusMessage.includes('Error') ? '#ff4444' : '#44ff44' }}>{statusMessage}</span>}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                padding: '12px 30px',
                                borderRadius: '30px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? 'Speichern...' : 'Szenario speichern'}
                        </button>
                    </div>
                )
            }
        </div>
    </div >
    );
};

export default TemplateCreator;
