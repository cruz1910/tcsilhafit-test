import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const MapComponent = ({
    lat = -27.5948,
    lng = -48.5482,
    zoom = 13,
    markerTitle = "Localização",
    markers = [], // Array de { id, lat, lng, title }
    onMarkerClick = null,
    autoFit = true
}) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayerRef = useRef(null);

    useEffect(() => {
        if (!window.L) {
            console.error("Leaflet não carregado. Verifique o index.html");
            return;
        }

        const L = window.L;

        // Inicializa o mapa se ainda não existir
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([lat, lng], zoom);

            L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=MFouw8iASb0sVoPbhqsk`, {
                attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            }).addTo(mapInstance.current);

            markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
        }

        // Atualiza a visualização principal
        if (markers.length === 0) {
            mapInstance.current.setView([lat, lng], zoom);
        }

        // Limpa marcadores antigos
        if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
        }

        // Adiciona novos marcadores
        if (markers && markers.length > 0) {
            markers.forEach(marker => {
                if (marker.lat && marker.lng) {
                    const m = L.marker([marker.lat, marker.lng])
                        .addTo(markersLayerRef.current)
                        .bindPopup(marker.title || "");

                    if (onMarkerClick) {
                        m.on('click', () => onMarkerClick(marker.id));
                    }
                }
            });

            // Se tiver múltiplos marcadores e autoFit estiver ativo, ajusta o zoom para caber todos
            if (autoFit) {
                if (markers.length > 1) {
                    const group = new L.featureGroup(
                        markers.filter(m => m.lat && m.lng).map(m => L.marker([m.lat, m.lng]))
                    );
                    mapInstance.current.fitBounds(group.getBounds().pad(0.1));
                } else if (markers.length === 1) {
                    mapInstance.current.setView([markers[0].lat, markers[0].lng], zoom);
                }
            } else {
                // Se autoFit for falso, mantém a visualização nas coordenadas passadas
                mapInstance.current.setView([lat, lng], zoom);
            }
        } else {
            // Caso de marcador único via props lat/lng (compatibilidade com modais)
            L.marker([lat, lng])
                .addTo(markersLayerRef.current)
                .bindPopup(markerTitle);
        }

        return () => {
            // Cleanup: removemos apenas se o componente for desmontado completamente
        };
    }, [lat, lng, zoom, markers, onMarkerClick]);

    // Cleanup final ao desmontar
    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <Box
            ref={mapRef}
            sx={{
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
                '& .leaflet-container': {
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    zIndex: 1
                }
            }}
        />
    );
};

export default MapComponent;
