import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCurrentBranch, loadBranches } from '../../slices/branchSlice';
import { clearCart } from '../../slices/cartSlice';
import type { Branch } from '../../types';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom SVG Marker Icons to guarantee visibility
const createMarkerIcon = (color: string) => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="
    background-color: ${color};
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  ">
    <div style="transform: rotate(45deg); font-size: 16px;">🏪</div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const DefaultIcon = createMarkerIcon('#666666'); // Dark gray for unselected
const SelectedIcon = createMarkerIcon('#C1121F'); // Brand red for selected
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map centering
const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.5 });
  }, [center, zoom, map]);
  return null;
};

// Distance calculation
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172]; // Ho Chi Minh City

const BranchSelector: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { branches, currentBranch, status } = useAppSelector((state) => state.branch);
  const { itemsByBranch } = useAppSelector((state) => state.cart);
  
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(12);

  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadBranches());
    }
  }, [dispatch, status]);

  // Center map on current branch initially if open
  useEffect(() => {
    if (open && currentBranch?.coordinates) {
      setMapCenter([currentBranch.coordinates.lat, currentBranch.coordinates.lng]);
      setMapZoom(14);
    }
  }, [open, currentBranch]);

  // Handle click outside to close dropdown/modal
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showConfirm) return;
      if (ref.current && ref.current.contains(e.target as Node)) return;
      if (modalRef.current && modalRef.current.contains(e.target as Node)) return;
      
      // Prevent closing if clicking on leaflet elements (sometimes they render outside)
      const target = e.target as HTMLElement;
      if (target.closest('.leaflet-container') || target.closest('.leaflet-popup')) return;
      
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showConfirm]);

  const handleSelectBranch = (branch: Branch) => {
    const currentId = String(currentBranch?.id || (currentBranch as any)?._id || '');
    const newId = String(branch.id || (branch as any)?._id || '');

    if (currentId === newId) {
      return;
    }

    const currentItems = currentId ? (itemsByBranch[currentId] || []) : [];
    const cartHasItems = currentItems.length > 0;
    
    if (cartHasItems) {
      setPendingBranch(branch);
      setShowConfirm(true);
    } else {
      dispatch(setCurrentBranch(branch));
    }
  };

  const confirmBranchChange = () => {
    if (pendingBranch) {
      dispatch(clearCart());
      dispatch(setCurrentBranch(pendingBranch));
    }
    setShowConfirm(false);
    setPendingBranch(null);
  };

  const cancelBranchChange = () => {
    setShowConfirm(false);
    setPendingBranch(null);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(coords);
        setMapCenter(coords);
        setMapZoom(13);
      },
      () => {
        setLocError("Từ chối quyền truy cập vị trí");
      }
    );
  };

  const branchName = currentBranch?.name || t('branch.selectBranch');

  // Process branches for map and list
  const processedBranches = useMemo(() => {
    return branches
      .filter((b) => b.is_active !== false)
      .map(b => {
        let distance = null;
        if (userLoc && b.coordinates) {
          distance = getDistance(userLoc[0], userLoc[1], b.coordinates.lat, b.coordinates.lng);
        }
        return { ...b, distance };
      })
      .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase())))
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [branches, userLoc, searchQuery]);

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        {/* Trigger Button inside Header */}
        <button
          onClick={() => setOpen(!open)}
          id="branch-selector-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0
          }}
        >
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {branchName}
          </span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
        </button>
      </div>

      {/* Main Map + List Modal */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            ref={modalRef}
            style={{
              background: 'white',
              borderRadius: 16,
              width: '90vw',
              maxWidth: 900,
              height: '85vh',
              maxHeight: 700,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#C1121F' }}>
                  {t('branch.selectBranch')}
                </h2>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {t('branch.currentBranch')}: <strong style={{ color: '#333' }}>{branchName}</strong>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                style={{
                  background: '#f5f5f5', border: 'none', width: 32, height: 32, 
                  borderRadius: '50%', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Map and List */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
              
              {/* Map Panel */}
              <div style={{ 
                flex: window.innerWidth < 768 ? '0 0 40%' : '2', 
                position: 'relative',
                borderRight: window.innerWidth < 768 ? 'none' : '1px solid #eee',
                borderBottom: window.innerWidth < 768 ? '1px solid #eee' : 'none',
                background: '#f8f9fa'
              }}>
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapUpdater center={mapCenter} zoom={mapZoom} />
                  
                  {userLoc && (
                    <Marker position={userLoc}>
                      <Popup>📍 Vị trí của bạn</Popup>
                    </Marker>
                  )}

                  {processedBranches.map(b => {
                    if (!b.coordinates) return null;
                    const bId = String(b.id || (b as any)._id);
                    const isSelected = bId === String(currentBranch?.id || (currentBranch as any)?._id);
                    return (
                      <React.Fragment key={bId}>
                        <Marker 
                          position={[b.coordinates.lat, b.coordinates.lng]}
                          icon={isSelected ? SelectedIcon : DefaultIcon}
                          eventHandlers={{
                            click: () => handleSelectBranch(b)
                          }}
                        >
                          <Popup>
                            <div style={{ padding: '4px 0', minWidth: 150 }}>
                              <strong style={{ display: 'block', fontSize: 14, color: '#C1121F', marginBottom: 4 }}>
                                {b.name}
                              </strong>
                              <div style={{ fontSize: 12, color: '#555', marginBottom: 8, lineHeight: 1.3 }}>
                                {b.address}
                              </div>
                              <button
                                onClick={() => handleSelectBranch(b)}
                                style={{
                                  background: isSelected ? '#4CAF50' : '#C1121F',
                                  color: 'white', border: 'none', padding: '6px 12px',
                                  borderRadius: 6, cursor: 'pointer', width: '100%', fontWeight: 600
                                }}
                              >
                                {isSelected ? '✓ Đang chọn' : 'Chọn siêu thị này'}
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                        {b.coverage_radius_km && (
                          <Circle center={[b.coordinates.lat, b.coordinates.lng]} radius={b.coverage_radius_km * 1000}
                            pathOptions={{ color: isSelected ? '#C1121F' : '#94a3b8', fillOpacity: isSelected ? 0.08 : 0.04, weight: isSelected ? 2 : 1 }} />
                        )}
                        {isSelected && userLoc && (
                          <Polyline positions={[userLoc, [b.coordinates.lat, b.coordinates.lng]]}
                            pathOptions={{ color: '#C1121F', weight: 3, dashArray: '8 8', opacity: 0.7 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </MapContainer>
                
                {/* Find Near Me Button Overlay */}
                <button
                  onClick={requestLocation}
                  style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 1000,
                    background: 'white', border: '1px solid #ddd', padding: '8px 12px',
                    borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
                    color: '#333'
                  }}
                >
                  🧭 Tìm gần tôi
                </button>
              </div>

              {/* List Panel */}
              <div style={{ 
                flex: window.innerWidth < 768 ? '1' : '1', 
                display: 'flex', flexDirection: 'column', 
                background: 'white', minWidth: 320
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc địa chỉ..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '1px solid #ddd', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {locError && (
                    <div style={{ fontSize: 12, color: '#d32f2f', marginTop: 8 }}>⚠️ {locError}</div>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                  {status === 'loading' ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#999' }}>Đang tải...</div>
                  ) : processedBranches.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#999', fontSize: 14 }}>
                      Không tìm thấy siêu thị phù hợp
                    </div>
                  ) : (
                    processedBranches.map((branch) => {
                      const bId = String(branch.id || (branch as any)?._id || '');
                      const cId = String(currentBranch?.id || (currentBranch as any)?._id || '');
                      const isActive = bId === cId;

                      return (
                        <div
                          key={bId}
                          onClick={() => {
                            if (branch.coordinates) {
                              setMapCenter([branch.coordinates.lat, branch.coordinates.lng]);
                              setMapZoom(15);
                            }
                            handleSelectBranch(branch);
                          }}
                          style={{
                            display: 'flex', gap: 12, padding: '14px',
                            background: isActive ? '#FFF0F0' : 'white',
                            border: isActive ? '1px solid #ffcdd2' : '1px solid transparent',
                            borderRadius: 12, cursor: 'pointer',
                            marginBottom: 8, transition: 'all 0.2s',
                          }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: isActive ? '#C1121F' : '#f5f5f5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: 18, color: isActive ? 'white' : '#999',
                          }}>
                            🏪
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: isActive ? 800 : 600, color: isActive ? '#C1121F' : '#333', marginBottom: 4 }}>
                              {branch.name}
                            </div>
                            {branch.address && (
                              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4, marginBottom: 4 }}>
                                {branch.address}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, color: '#888' }}>
                              {branch.operating_hours && (
                                <span>🕐 {branch.operating_hours}</span>
                              )}
                              {branch.distance !== null ? (
                                <span style={{ color: '#0288d1', fontWeight: 600 }}>
                                  📍 Cách {branch.distance.toFixed(1)} km
                                </span>
                              ) : !branch.coordinates && (
                                <span style={{ color: '#d32f2f', fontWeight: 600 }}>
                                  📍 Không có vị trí
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Cart Clear) */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={cancelBranchChange}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 20, padding: '28px 32px',
              maxWidth: 440, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#FFF5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', fontSize: 28,
              }}>
                ⚠️
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#333', marginBottom: 8 }}>
                {t('cart.branchChangeTitle')}
              </h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                {t('cart.branchWarning')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={cancelBranchChange}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  border: '2px solid #e0e0e0', background: 'white',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#555'
                }}
              >
                {t('cart.cancel')}
              </button>
              <button
                onClick={confirmBranchChange}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                  background: '#C1121F', color: 'white', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(193,18,31,0.3)',
                }}
              >
                {t('cart.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BranchSelector;
