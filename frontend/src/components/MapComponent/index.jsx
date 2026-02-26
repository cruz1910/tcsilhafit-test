import React, { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';

const MapComponent = ({
    lat = -27.5948,
    lng = -48.5482,
    zoom = 13,
    markerTitle = "Localização",
    markers = [], // Array de { id, lat, lng, title }
    onMarkerClick = null,
    autoFit = true,
    selectedId = null
}) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayerRef = useRef(null);
    const markerObjectsRef = useRef({});
    const prevMarkersKeyRef = useRef('');

    // Inicializa o mapa uma vez
    useEffect(() => {
        if (!window.L || mapInstance.current) return;
        const L = window.L;

        mapInstance.current = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([lat, lng], zoom);

        L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=MFouw8iASb0sVoPbhqsk`, {
            attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        }).addTo(mapInstance.current);

        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Atualiza marcadores quando a lista de markers muda
    useEffect(() => {
        if (!mapInstance.current || !window.L) return;
        const L = window.L;

        // Chave para detectar mudança real nos markers
        const markersKey = markers.map(m => `${m.id}`).sort().join(',');
        const markersChanged = markersKey !== prevMarkersKeyRef.current;
        prevMarkersKeyRef.current = markersKey;

        // Limpa marcadores antigos
        if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
        }
        markerObjectsRef.current = {};

        if (markers && markers.length > 0) {
            const validMarkers = markers.filter(m => m.lat && m.lng);

            validMarkers.forEach(marker => {
                const isSelected = marker.id === selectedId;
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="
                        width: ${isSelected ? '18px' : '14px'};
                        height: ${isSelected ? '18px' : '14px'};
                        background: ${isSelected ? '#EF4444' : '#3B82F6'};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        transition: all 0.2s;
                    "></div>`,
                    iconSize: [isSelected ? 24 : 20, isSelected ? 24 : 20],
                    iconAnchor: [isSelected ? 12 : 10, isSelected ? 12 : 10],
                });

                const m = L.marker([marker.lat, marker.lng], { icon })
                    .addTo(markersLayerRef.current)
                    .bindPopup(`<b>${marker.title || ''}</b>`);

                if (onMarkerClick) {
                    m.on('click', () => onMarkerClick(marker.id));
                }

                markerObjectsRef.current[marker.id] = m;
            });

            // Ajusta zoom apenas quando a lista de markers muda (filtros), não quando selectedId muda
            if (autoFit && markersChanged) {
                if (validMarkers.length > 1) {
                    const group = L.featureGroup(
                        validMarkers.map(m => L.marker([m.lat, m.lng]))
                    );
                    mapInstance.current.fitBounds(group.getBounds().pad(0.15), {
                        maxZoom: 15,
                        animate: true,
                        duration: 0.5,
                    });
                } else if (validMarkers.length === 1) {
                    mapInstance.current.setView([validMarkers[0].lat, validMarkers[0].lng], 14, { animate: true });
                }
            }
        } else {
            // Sem markers: mostra posição padrão
            if (markersChanged) {
                mapInstance.current.setView([lat, lng], zoom, { animate: true });
            }
            L.marker([lat, lng])
                .addTo(markersLayerRef.current)
                .bindPopup(markerTitle);
        }
    }, [markers, selectedId, onMarkerClick, autoFit, lat, lng, zoom, markerTitle]);

    // Pan suave ao selecionar um marker pela sidebar
    useEffect(() => {
        if (!mapInstance.current || !selectedId) return;
        const markerObj = markerObjectsRef.current[selectedId];
        if (markerObj) {
            const latlng = markerObj.getLatLng();
            mapInstance.current.panTo(latlng, { animate: true, duration: 0.4 });
            markerObj.openPopup();
        }
    }, [selectedId]);

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
