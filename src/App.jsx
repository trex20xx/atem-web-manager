import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import QuadrantGrid from './components/Multiview/QuadrantGrid';
import SettingsModal from './components/Settings/SettingsModal';
import GlobalTooltip from './components/UI/GlobalTooltip';
import { useDevices } from './hooks/useDevices';
import { useDragDrop } from './hooks/useDragDrop';
import { useLocalStorage } from './hooks/useLocalStorage';
import { APP_VERSION } from './version';

// =========================================================================
// ATEM WEB MANAGER - MASTER LAYOUT (v3.89)
// =========================================================================

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
  const [enhancedText, setEnhancedText] = useLocalStorage('atem_enhancedText', false);
  
  const [useDeviceCsv, setUseDeviceCsv] = useLocalStorage('atem_useDeviceCsv', false);
  const [deviceCsvContent, setDeviceCsvContent] = useLocalStorage('atem_deviceCsvContent', '');
  
  const [consoleFont, setConsoleFont] = useLocalStorage('atem_consoleFont', 'Pandorum');

  const [currentVideoSource, setCurrentVideoSource] = useLocalStorage('atem_currentVideoSource', 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4');
  
  const [quadrantOrder, setQuadrantOrder] = useLocalStorage('atem_quadrantOrder', [1, 2, 3, 5]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarRevealed, setIsSidebarRevealed] = useState(false);
  const [isToolbarRevealed, setIsToolbarRevealed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [dashboardStyle, setDashboardStyle] = useState({ width: '100%', height: '100%', top: 50 });

  const deviceState = useDevices();
  const { 
      handleQuadrantDragStart, handleQuadrantDragOver, 
      handleQuadrantDragLeave, handleQuadrantDrop 
  } = useDragDrop(enableQuadrantDrag);

  const connectedDevice = deviceState.devices.find(d => d.status === 'online');
  const isConnected = !!connectedDevice;

  const dispatchSysLog = (msg) => {
      window.dispatchEvent(new CustomEvent('atem:system-log', { detail: msg }));
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
      if (isFirstMount.current) {
          isFirstMount.current = false;
          dispatchSysLog('Application mounted. UI initialized.');
      }
  }, []);

  const getResolvedStreamSource = () => {
    if (useDeviceCsv && isConnected && connectedDevice) {
        const lines = deviceCsvContent.split('\n');
        for (let line of lines) {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const ip = parts[0].trim();
                if (ip === connectedDevice.ip) {
                    return parts[2].trim();
                }
            }
        }
    }
    return currentVideoSource;
  };

  const resolvedVideoSource = getResolvedStreamSource();

  const handleResize = () => {
    const isDocked = !isSidebarCollapsed;
    const paddingLeft = isDocked ? 284 : 16;
    const paddingRight = 16;
    const paddingTop = isDocked ? 50 : 16;
    const paddingBottom = 16;

    const availableWidth = Math.max(100, window.innerWidth - paddingLeft - paddingRight);
    const availableHeight = Math.max(100, window.innerHeight - paddingTop - paddingBottom);

    let width = availableWidth;
    let height = width * 9 / 16;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * 16 / 9;
    }

    const quadH = Math.max(100, Math.round(height));
    const quadW = Math.max(100, Math.round(width));
    const quadTop = paddingTop + (availableHeight - quadH) / 2;

    setDashboardStyle({ width: quadW, height: quadH, top: quadTop });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const handleZoomKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleZoomKeys);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleZoomKeys);
    };
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      dispatchSysLog('Entered Fullscreen Mode');
    } else {
      document.exitFullscreen().catch(() => {});
      dispatchSysLog('Exited Fullscreen Mode');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        setIsSettingsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsSettingsOpen(false);
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        setIsSidebarCollapsed(prev => !prev);
        setIsToolbarRevealed(false);
        setIsSidebarRevealed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  useEffect(() => {
    if (theme === 'default') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--panel-radius', panelRadius + 'px');
    document.documentElement.style.setProperty('--tally-opacity', tallyOpacity / 100);
  }, [panelRadius, tallyOpacity]);

  useEffect(() => {
    if (enhancedText) document.documentElement.setAttribute('data-enhanced-text', 'true');
    else document.documentElement.removeAttribute('data-enhanced-text');
  }, [enhancedText]);

  const toggleLightMode = () => {
      const next = theme === 'light' ? 'default' : 'light';
      setTheme(next);
      dispatchSysLog('Theme switched to ' + next.toUpperCase());
  };

  const activeDevice = connectedDevice 
    || deviceState.devices.find(d => d.id === deviceState.selectedDeviceId)
    || deviceState.devices.find(d => d.ip === '192.168.10.240')
    || deviceState.devices[0];

  const hasCustomName = activeDevice && activeDevice.name && activeDevice.name.trim() !== '' && activeDevice.name !== activeDevice.ip;
  const hasCustomGroup = activeDevice && activeDevice.group && activeDevice.group.trim() !== '' && activeDevice.group.toUpperCase() !== 'UNGROUPED';
  const deviceIp = activeDevice ? activeDevice.ip : '192.168.10.240';

  return (
    <div className="app-root-container">
      <GlobalTooltip />

      {isSidebarCollapsed && (
        <div 
          className="toolbar-hover-sensor"
          onMouseEnter={() => setIsToolbarRevealed(true)}
        />
      )}

      {isSidebarCollapsed && (
        <div 
          className="sidebar-hover-sensor"
          style={{ top: dashboardStyle.top + 'px', height: dashboardStyle.height + 'px' }}
          onMouseEnter={() => setIsSidebarRevealed(true)}
          onMouseLeave={(e) => {
              if (e.clientX <= 16 || e.clientY <= dashboardStyle.top || e.clientY >= dashboardStyle.top + dashboardStyle.height) {
                  setIsSidebarRevealed(false);
              }
          }}
        />
      )}

      <header 
        className={'app-top-bar ' + (isSidebarCollapsed ? 'collapsed-mode ' : '') + (isToolbarRevealed ? 'revealed' : '')}
        onMouseEnter={() => isSidebarCollapsed && setIsToolbarRevealed(true)}
        onMouseLeave={() => isSidebarCollapsed && setIsToolbarRevealed(false)}
      >
        <div className="top-bar-left">
          <button 
            className="top-bar-btn"
            onClick={() => {
              setIsSidebarCollapsed(prev => !prev);
              setIsToolbarRevealed(false);
              setIsSidebarRevealed(false);
            }}
            data-description={isSidebarCollapsed ? 'Expand navigation menu (~)' : 'Collapse navigation menu (~)'}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          {!isConnected ? (
            <span className="app-title not-connected">NOT CONNECTED</span>
          ) : (
            <span className="app-title connected">
              {hasCustomName && (
                <>
                  <span className="app-title-name">
                    {forceUppercase ? activeDevice.name.trim().toUpperCase() : activeDevice.name.trim()}
                  </span>
                  <span className="app-title-dot">{'\u2022'}</span>
                </>
              )}
              {hasCustomGroup && (
                <>
                  <span className="app-title-group">
                    {forceUppercase ? activeDevice.group.trim().toUpperCase() : activeDevice.group.trim()}
                  </span>
                  <span className="app-title-dot">{'\u2022'}</span>
                </>
              )}
              <span className="app-title-ip">{deviceIp}</span>
            </span>
          )}
        </div>

        <div className="top-bar-right">
          <span 
            className={'top-bar-version ' + (showVersion ? 'visible' : 'faded')}
            onClick={() => setShowVersion(prev => !prev)}
            data-description={showVersion ? 'Click to hide version' : 'Click to reveal version'}
          >
            {APP_VERSION}
          </span>

          <div 
            className={'apple-theme-switch ' + (theme === 'light' ? 'active' : '')}
            onClick={toggleLightMode}
            data-description={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <div className="apple-switch-thumb">
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4.5" fill="#000000" stroke="none" />
                  <line x1="12" y1="1.5" x2="12" y2="4.5" />
                  <line x1="12" y1="19.5" x2="12" y2="22.5" />
                  <line x1="1.5" y1="12" x2="4.5" y2="12" />
                  <line x1="19.5" y1="12" x2="22.5" y2="12" />
                  <line x1="4.5" y1="4.5" x2="6.7" y2="6.7" />
                  <line x1="17.3" y1="17.3" x2="19.5" y2="19.5" />
                  <line x1="4.5" y1="19.5" x2="6.7" y2="17.3" />
                  <line x1="17.3" y1="6.7" x2="19.5" y2="4.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="10" height="10" fill="#000000">
                  <path d="M20.5 14.8A9 9 0 0 1 9.2 3.5a9.5 9.5 0 1 0 11.3 11.3z" />
                </svg>
              )}
            </div>
          </div>

          <button 
            className="top-bar-btn"
            onClick={toggleFullscreen}
            data-description={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            )}
          </button>

          <button 
            className="top-bar-btn"
            onClick={() => setIsSettingsOpen(true)}
            data-description="Settings (Cmd/Ctrl + ,)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49-.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
          </button>
        </div>
      </header>

      <div className={'dashboard ' + (isSidebarCollapsed ? 'sidebar-collapsed' : '')}>
        <Sidebar 
          top={dashboardStyle.top}
          height={dashboardStyle.height}
          showActionButton={showActionButton}
          enableDragDrop={enableDragDrop}
          forceUppercase={forceUppercase}
          deviceState={deviceState}
          variant={sidebarVariant}
          isCollapsed={isSidebarCollapsed}
          isRevealed={isSidebarRevealed}
          setIsRevealed={setIsSidebarRevealed}
        />
        <main className="quadrant-wrapper" style={{ width: dashboardStyle.width + 'px', height: dashboardStyle.height + 'px' }}>
          <QuadrantGrid 
            quadrantOrder={quadrantOrder}
            currentVideoSource={resolvedVideoSource}
            isConnected={isConnected}
            connectedDevice={connectedDevice}
            activeDeviceIp={deviceIp}
            isLoading={deviceState.isLoading}
            enableQuadrantDrag={enableQuadrantDrag}
            handleQuadrantDragStart={handleQuadrantDragStart}
            handleQuadrantDragOver={handleQuadrantDragOver}
            handleQuadrantDragLeave={handleQuadrantDragLeave}
            handleQuadrantDrop={handleQuadrantDrop}
            setQuadrantOrder={setQuadrantOrder}
            consoleFont={consoleFont}
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
        enhancedText={enhancedText} setEnhancedText={setEnhancedText}
        currentVideoSource={currentVideoSource} setCurrentVideoSource={setCurrentVideoSource}
        useDeviceCsv={useDeviceCsv} setUseDeviceCsv={setUseDeviceCsv}
        deviceCsvContent={deviceCsvContent} setDeviceCsvContent={setDeviceCsvContent}
        quadrantOrder={quadrantOrder} setQuadrantOrder={setQuadrantOrder}
        sidebarVariant={sidebarVariant} setSidebarVariant={setSidebarVariant}
        consoleFont={consoleFont} setConsoleFont={setConsoleFont}
      /> 
    </div>
  );
}

export default App;