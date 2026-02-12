import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Paper,
    Button,
    useTheme,
    alpha,
} from '@mui/material';
import { FaRobot, FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';

const ModalChatIA = ({ open, onClose }) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([
        { id: 1, text: 'Olá! Sou seu assistente IlhaFit. Como posso ajudar você a transformar sua saúde hoje? Busque por academias, aulas ou personal trainers!', sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: messages.length + 1, text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        setTimeout(() => {
            let aiText = "Com base no que você disse, recomendo conferir o CrossFit IlhaFit ou o Studio de Pilates Core. Ambos têm ótimas avaliações!";

            if (inputValue.toLowerCase().includes('musculação')) {
                aiText = "Entendi! Para musculação, a Academia ProFit no Centro é excelente. Quer que eu mostre o endereço?";
            } else if (inputValue.toLowerCase().includes('yoga')) {
                aiText = "Yoga é fantástico! Recomendo o Espaço Zen. Eles têm turmas abertas para iniciantes.";
            }

            const aiMsg = { id: messages.length + 2, text: aiText, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'white',
                p: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                        <FaRobot />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Busca com IA</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Online agora</Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <FaTimes />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                overflow: 'hidden'
            }}>
                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, mb: 2, pr: 1 }}>
                    {messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                                alignItems: 'flex-end',
                                gap: 1
                            }}
                        >
                            {msg.sender === 'ai' && (
                                <Avatar size="small" sx={{ width: 32, height: 32, bgcolor: 'primary.main', mb: 0.5 }}>
                                    <FaRobot size={16} />
                                </Avatar>
                            )}
                            <Paper sx={{
                                p: 1.5,
                                maxWidth: '80%',
                                borderRadius: msg.sender === 'ai' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                                bgcolor: msg.sender === 'ai' ? 'white' : 'primary.main',
                                color: msg.sender === 'ai' ? 'text.primary' : 'white',
                                boxShadow: theme.shadows[1]
                            }}>
                                <Typography variant="body2">{msg.text}</Typography>
                            </Paper>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        placeholder="Como posso te ajudar?"
                        variant="outlined"
                        size="small"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.paper'
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        <FaPaperPlane size={18} />
                    </IconButton>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ModalChatIA;
