import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import QuadrantGrid from './components/Multiview/QuadrantGrid';
import SettingsModal from './components/Settings/SettingsModal';
import GlobalTooltip from './components/UI/GlobalTooltip';
import { useDevices } from './hooks/useDevices';
import { useDragDrop } from './hooks/useDragDrop';
import { useLocalStorage } from './hooks/useLocalStorage';

// =========================================================================
// ATEM WEB MANAGER - MASTER LAYOUT (v1.84)
// =========================================================================

function App() {
  const [theme, setTheme] = useLocalStorage('atem_theme', 'default');
  const [panelRadius, setPanelRadius] = useLocalStorage('atem_panelRadius', 9);
  const [titlePosition, setTitlePosition] = useLocalStorage('atem_titlePosition', 'off');
  const [showVersion, setShowVersion] = useLocalStorage('atem_showVersion', true);
  const [sidebarVariant, setSidebarVariant] = useLocalStorage('atem_sidebarVariant', 'floating');
  
  const [enableDragDrop, setEnableDragDrop] = useLocalStorage('atem_enableDragDrop', true);
  const [enableQuadrantDrag, setEnableQuadrantDrag] = useLocalStorage('atem_enableQuadrantDrag', true);
  const [showActionButton, setShowActionButton] = useLocalStorage('atem_showActionButton', true);
  const [forceUppercase, setForceUppercase] = useLocalStorage('atem_forceUppercase', true);
  
  const [currentVideoSource, setCurrentVideoSource] = useLocalStorage('atem_currentVideoSource', 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4');
  const [quadrantOrder, setQuadrantOrder] = useLocalStorage('atem_quadrantOrder', [1, 2, 3, 4]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [versionVisible, setVersionVisible] = useState(true);
  
  const [dashboardStyle, setDashboardStyle] = useState({ width: '100%', height: '100%' });
  const [headerStyle, setHeaderStyle] = useState({ display: 'none' });

  const deviceState = useDevices();
  const { 
      handleQuadrantDragStart, handleQuadrantDragOver, 
      handleQuadrantDragLeave, handleQuadrantDrop 
  } = useDragDrop(enableQuadrantDrag);

  const connectedDevice = deviceState.devices.find(d => d.status === 'online');
  const isConnected = !!connectedDevice;

  useEffect(() => {
    const handleResize = () => {
      const sidebarWidth = 260;
      const gap = 8;
      const padding = 32;
      const availableWidth = Math.max(100, window.innerWidth - sidebarWidth - gap - padding);
      const availableHeight = Math.max(100, window.innerHeight - padding);

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

      const totalDashboardWidth = sidebarWidth + gap + width;
      const dashboardLeft = (window.innerWidth - totalDashboardWidth) / 2;
      const dashboardTop = (window.innerHeight - height) / 2;

      if (titlePosition === 'off') {
        setHeaderStyle({ display: 'none' });
        return;
      }

      const headerTop = Math.max(4, (dashboardTop / 2) - 12);
      let hStyle = { display: 'block', top: `${headerTop}px`, transform: 'none' };

      if (titlePosition === 'left') {
        hStyle.left = `${Math.max(16, dashboardLeft)}px`;
        hStyle.right = 'auto';
      } else if (titlePosition === 'centered') {
        hStyle.left = `${dashboardLeft + totalDashboardWidth / 2}px`;
        hStyle.transform = 'translateX(-50%)';
        hStyle.right = 'auto';
      } else if (titlePosition === 'right') {
        hStyle.left = 'auto';
        hStyle.right = `${Math.max(16, window.innerWidth - (dashboardLeft + totalDashboardWidth))}px`;
      }

      setHeaderStyle(hStyle);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [titlePosition]);

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
  }, [panelRadius]);

  const toggleLightMode = () => {
      setTheme(prev => prev === 'light' ? 'default' : 'light');
  };

  return (
    <>
      <GlobalTooltip />
      <div className="header" style={headerStyle}>ATEM WEB MANAGER</div>
      
      <button className="theme-toggle-btn" onClick={toggleLightMode} title="Toggle Light/Dark Theme">
          {theme === 'light' ? (
              <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          )}
      </button>

      <button className="gear-btn" onClick={() => setIsSettingsOpen(true)} title="Preferences (Cmd/Ctrl + ,)">
        <svg viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.05-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.22-.07.49.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c-.12.22.37.29.59.22l2.39-.96c-.5.38 1.03.7 1.62.94l.36 2.54c-.05.24-.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6,1.62,3.6,3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      </button>

      {showVersion && (
          <div 
            className="version-tag" 
            onClick={() => setVersionVisible(!versionVisible)}
            style={{ opacity: versionVisible ? 1 : 0 }}
          >
              v1.84
          </div>
      )}

      <SettingsModal 
          isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
          theme={theme} setTheme={setTheme}
          panelRadius={panelRadius} setPanelRadius={setPanelRadius}
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

      <div className="dashboard">
        <Sidebar 
            height={dashboardStyle.height}
            showActionButton={showActionButton}
            enableDragDrop={enableDragDrop}
            forceUppercase={forceUppercase}
            deviceState={deviceState}
            variant={sidebarVariant}
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
    </>
  );
}

export default App;