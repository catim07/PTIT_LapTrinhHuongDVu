import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCurrentBranch, loadBranches } from '../../slices/branchSlice';
import { clearCart } from '../../slices/cartSlice';
import type { Branch } from '../../types';

const BranchSelector: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { branches, currentBranch, status } = useAppSelector((state) => state.branch);
  const { itemsByBranch } = useAppSelector((state) => state.cart);
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadBranches());
    }
  }, [dispatch, status]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectBranch = (branch: Branch) => {
    const currentId = String(currentBranch?.id || (currentBranch as any)?._id || '');
    const newId = String(branch.id || (branch as any)?._id || '');

    if (currentId === newId) {
      setOpen(false);
      return;
    }

    // Check if cart has items → show warning
    const currentItems = currentId ? (itemsByBranch[currentId] || []) : [];
    const cartHasItems = currentItems.length > 0;
    if (cartHasItems) {
      setPendingBranch(branch);
      setShowConfirm(true);
      setOpen(false);
    } else {
      dispatch(setCurrentBranch(branch));
      setOpen(false);
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

  const branchName = currentBranch?.name || t('branch.selectBranch');
  const branchCity = currentBranch?.city || '';

  return (
    <>
      <div ref={ref} style={{ position: 'relative', zIndex: 200 }}>
        <button
          onClick={() => setOpen(!open)}
          id="branch-selector-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)',
            maxWidth: 220,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
        >
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {branchName}
          </span>
          <span style={{ fontSize: 10, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
              border: '1px solid rgba(0,0,0,0.06)',
              minWidth: 300,
              maxHeight: 420,
              overflowY: 'auto',
              animation: 'fadeInDown 0.2s ease',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f0f0f0',
              background: 'linear-gradient(135deg, #FFF5F5, #fff)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#C1121F', marginBottom: 2 }}>
                📍 {t('branch.selectBranch')}
              </div>
              {currentBranch && (
                <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>
                  {t('branch.currentBranch')}: <strong style={{ color: '#333' }}>{branchName}</strong>
                  {branchCity && <span> — {branchCity}</span>}
                </div>
              )}
            </div>

            {/* Branches list */}
            {status === 'loading' ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                {t('common.loading')}
              </div>
            ) : branches.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>
                Chưa có chi nhánh nào
              </div>
            ) : (
              <div style={{ padding: 8 }}>
                {branches
                  .filter((b) => b.is_active !== false)
                  .map((branch) => {
                    const bId = String(branch.id || (branch as any)?._id || '');
                    const cId = String(currentBranch?.id || (currentBranch as any)?._id || '');
                    const isActive = bId === cId;

                    return (
                      <button
                        key={bId}
                        onClick={() => handleSelectBranch(branch)}
                        id={`branch-option-${bId}`}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          width: '100%',
                          padding: '12px 14px',
                          border: 'none',
                          background: isActive ? '#FFF0F0' : 'white',
                          cursor: 'pointer',
                          borderRadius: 12,
                          transition: 'all 0.15s',
                          textAlign: 'left',
                          borderLeft: isActive ? '3px solid #C1121F' : '3px solid transparent',
                          marginBottom: 2,
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#fafafa'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'white'; }}
                      >
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isActive ? '#C1121F' : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: 16,
                          color: isActive ? 'white' : '#999',
                        }}>
                          🏪
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: isActive ? 800 : 600,
                            color: isActive ? '#C1121F' : '#333',
                            marginBottom: 2,
                          }}>
                            {branch.name}
                          </div>
                          {branch.address && (
                            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {branch.address}
                            </div>
                          )}
                          {branch.operating_hours && (
                            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                              🕐 {branch.operating_hours}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <span style={{ color: '#C1121F', fontWeight: 800, fontSize: 16, flexShrink: 0, alignSelf: 'center' }}>✓</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Confirmation Modal ──────────────────────────── */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={cancelBranchChange}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '28px 32px',
              maxWidth: 440,
              width: '90%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              animation: 'scaleIn 0.2s ease',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#FFF5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: 28,
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
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: '2px solid #e0e0e0',
                  background: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  color: '#555',
                  transition: 'all 0.15s',
                }}
              >
                {t('cart.cancel')}
              </button>
              <button
                onClick={confirmBranchChange}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: '#C1121F',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(193,18,31,0.3)',
                  transition: 'all 0.15s',
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
