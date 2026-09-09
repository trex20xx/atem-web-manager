import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import QuadrantGrid from './components/Multiview/QuadrantGrid';
import SettingsModal from './components/Settings/SettingsModal';
import GlobalTooltip from './components/UI/GlobalTooltip';
import { useDevices } from './hooks/useDevices';
import { useDragDrop } from './hooks/useDragDrop';
import { useLocalStorage } from './hooks/useLocalStorage';

// =========================================================================
// ATEM WEB MANAGER - MASTER LAYOUT (v2.16.0)
// =========================================================================
// Unified Top Navigation Bar, Zero-Overlap 16:9 Math, Apple Theme Switch.

function App() {
  const [theme, setTheme] = useLocalStorage('atem_theme', 'default');
  const [panelRadius, setPanelRadius] = useLocalStorage('atem_panelRadius', 9);
  const [tallyOpacity, setTallyOpacity] = useLocalStorage('atem_tallyOpacity', 85);
  const [titlePosition, setTitlePosition] = useLocalStorage('atem_titlePosition', 'left');
  const [showVersion, setShowVersion] = useLocalStorage('atem_showVersion', true);
  const [sidebarVariant, setSidebarVariant] = useLocalStorage('atem_sidebarVariant', 'classic');
  
  const [enableDragDrop, setEnableDragDrop] = useLocalStorage('atem_enableDragDrop', true);
  const [enableQuadrantDrag, setEnableQuadrantDrag] = useLocalStorage('atem_enableQuadrantDrag', true);
  const [showActionButton, setShowActionButton] = useLocalStorage('atem_showActionButton', true);
  const [forceUppercase, setForceUppercase] = useLocalStorage('atem_forceUppercase', true);
  
  const [currentVideoSource, setCurrentVideoSource] = useLocalStorage('atem_currentVideoSource', 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4');
  const [quadrantOrder, setQuadrantOrder] = useLocalStorage('atem_quadrantOrder', [1, 2, 3, 4]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [dashboardStyle, setDashboardStyle] = useState({ width: '100%', height: '100%' });

  const deviceState = useDevices();
  const { 
      handleQuadrantDragStart, handleQuadrantDragOver, 
      handleQuadrantDragLeave, handleQuadrantDrop 
  } = useDragDrop(enableQuadrantDrag);

  const connectedDevice = deviceState.devices.find(d => d.status === 'online');
  const isConnected = !!connectedDevice;

  // Zero-Overlap 16:9 Math Engine (Accounting cleanly for Top Bar)
  useEffect(() => {
    const handleResize = () => {
      const topBarHeight = 42;
      const sidebarWidth = isSidebarCollapsed ? 0 : 260;
      const gap = isSidebarCollapsed ? 0 : 8;
      const horizontalPadding = 32;
      const verticalPadding = 24;

      const availableWidth = Math.max(100, window.innerWidth - sidebarWidth - gap - horizontalPadding);
      const availableHeight = Math.max(100, window.innerHeight - topBarHeight - verticalPadding);

      let width = availableWidth;
      let height = width * 9 / 16;
      if (height > availableHeight) {
        height = availableHeight;
        width = height * 16 / 9;
      }

      setDashboardStyle({
        width: Math.max(100, width),
        height: Math.max(100, height)
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Global Keybind for Settings (Cmd/Ctrl + ,)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (theme === 'default') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--panel-radius', `${panelRadius}px`);
    document.documentElement.style.setProperty('--tally-opacity', tallyOpacity / 100);
  }, [panelRadius, tallyOpacity]);

  const toggleLightMode = () => {
      setTheme(prev => prev === 'light' ? 'default' : 'light');
  };

  return (
    <div className="app-root-container">
      <GlobalTooltip />

      {/* UNIFIED TOP CONTROL BAR */}
      <header className="app-top-bar">
        <div className="top-bar-left">
          <button 
            className="top-bar-btn"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            title="Toggle Navigation Menu"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          {titlePosition === 'left' && (
            <span className="app-title">ATEM WEB MANAGER</span>
          )}
        </div>

        {titlePosition === 'centered' && (
          <span className="app-title centered">ATEM WEB MANAGER</span>
        )}

        <div className="top-bar-right">
          {titlePosition === 'right' && (
            <span className="app-title">ATEM WEB MANAGER</span>
          )}

          {/* Version Tag with Click-to-Fade Toggle */}
          <span 
            className={`top-bar-version ${showVersion ? 'visible' : 'faded'}`}
            onClick={() => setShowVersion(prev => !prev)}
            title={showVersion ? "Click to hide" : "Click to reveal"}
          >
            v2.16.0
          </span>

          {/* Apple-Style Monochrome Theme Switch with Sun/Moon Icons */}
          <div 
            className={`apple-theme-switch ${theme === 'light' ? 'active' : ''}`}
            onClick={toggleLightMode}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            <div className="apple-switch-thumb">
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29zm-13.78 1.41l1.29-1.29c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.29 1.29c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zm12.37-12.37l1.29-1.29c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.29 1.29c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.3 2a10 10 0 0 0-.19 2 10 10 0 0 0 10 10c.7 0 1.37-.07 2-.19A10 10 0 0 1 12.3 2z"/>
                </svg>
              )}
            </div>
          </div>

          {/* Settings Gear Button */}
          <button 
            className="top-bar-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings (Cmd/Ctrl + ,)"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.05-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.22-.07.49.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className={`dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar 
          height={dashboardStyle.height}
          showActionButton={showActionButton}
          enableDragDrop={enableDragDrop}
          forceUppercase={forceUppercase}
          deviceState={deviceState}
          variant={sidebarVariant}
          isCollapsed={isSidebarCollapsed}
        />
        <main className="quadrant-wrapper" style={{ width: `${dashboardStyle.width}px`, height: `${dashboardStyle.height}px` }}>
          <QuadrantGrid 
            quadrantOrder={quadrantOrder}
            currentVideoSource={currentVideoSource}
            isConnected={isConnected}
            connectedDevice={connectedDevice}
            isLoading={deviceState.isLoading}
            enableQuadrantDrag={enableQuadrantDrag}
            handleQuadrantDragStart={handleQuadrantDragStart}
            handleQuadrantDragOver={handleQuadrantDragOver}
            handleQuadrantDragLeave={handleQuadrantDragLeave}
            handleQuadrantDrop={handleQuadrantDrop}
            setQuadrantOrder={setQuadrantOrder}
          />
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        theme={theme} setTheme={setTheme}
        panelRadius={panelRadius} setPanelRadius={setPanelRadius}
        tallyOpacity={tallyOpacity} setTallyOpacity={setTallyOpacity}
        titlePosition={titlePosition} setTitlePosition={setTitlePosition}
        showVersion={showVersion} setShowVersion={setShowVersion}
        enableDragDrop={enableDragDrop} setEnableDragDrop={setEnableDragDrop}
        enableQuadrantDrag={enableQuadrantDrag} setEnableQuadrantDrag={setEnableQuadrantDrag}
        showActionButton={showActionButton} setShowActionButton={setShowActionButton}
        forceUppercase={forceUppercase} setForceUppercase={setForceUppercase}
        currentVideoSource={currentVideoSource} setCurrentVideoSource={setCurrentVideoSource}
        quadrantOrder={quadrantOrder} setQuadrantOrder={setQuadrantOrder}
        sidebarVariant={sidebarVariant} setSidebarVariant={setSidebarVariant}
      /> 
    </div>
  );
}

export default App;