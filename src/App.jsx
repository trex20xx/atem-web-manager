import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import QuadrantGrid from './components/Multiview/QuadrantGrid';
import SettingsModal from './components/Settings/SettingsModal';
import { useDevices } from './hooks/useDevices';
import { useDragDrop } from './hooks/useDragDrop';

// =========================================================================
// ATEM WEB MANAGER - MASTER LAYOUT (v1.75)
// =========================================================================
// Controls the absolute resize math for the 16:9 locked aspect ratio,
// mounts the global UI elements, and houses the child components.

function App() {
  // --- Global Settings State ---
  const [theme, setTheme] = useState('default');
  const [panelRadius, setPanelRadius] = useState(4); // [LOCKED] Default 4px, Max 24px
  const [titlePosition, setTitlePosition] = useState('off');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showVersion, setShowVersion] = useState(true);
  
  // Toggles & Preferences
  const [enableDragDrop, setEnableDragDrop] = useState(true);
  const [showActionButton, setShowActionButton] = useState(true);
  const [forceUppercase, setForceUppercase] = useState(true);
  
  // Media State
  const [currentVideoSource, setCurrentVideoSource] = useState('https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4');
  const [quadrantOrder, setQuadrantOrder] = useState([1, 2, 3, 4]);
  
  // --- Dashboard Math State ([LOCKED] 16:9 strict sizing) ---
  const [dashboardStyle, setDashboardStyle] = useState({ width: '100%', height: '100%' });
  const [headerStyle, setHeaderStyle] = useState({ display: 'none' });

  // --- Initialize Custom Hooks ---
  const deviceState = useDevices();
  const { 
      handleQuadrantDragStart, handleQuadrantDragOver, 
      handleQuadrantDragLeave, handleQuadrantDrop 
  } = useDragDrop(enableDragDrop);

  // Check if any device is connected for Quadrant 1 rendering
  const isConnected = deviceState.devices.some(d => d.status === 'online');

  // --- [LOCKED] Dashboard Math Logic ---
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

  // --- Global Keybind for Settings (Cmd/Ctrl + ,) ---
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

  // --- Sync Theme to Document ---
  useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // --- Sync Global Radius Variable ---
  useEffect(() => {
    document.documentElement.style.setProperty('--panel-radius', `${panelRadius}px`);
  }, [panelRadius]);

  // Prevent drag-drop from acting weird globally if not on an actual dropzone
  useEffect(() => {
    const preventDefault = (e) => { if (!enableDragDrop) e.preventDefault(); };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, [enableDragDrop]);

  return (
    <>
      {/* Global Overlays */}
      <div className="header" style={headerStyle}>
        ATEM WEB MANAGER
      </div>
      
      <button 
        className="gear-btn" 
        onClick={() => setIsSettingsOpen(true)} 
        title="Preferences (Cmd/Ctrl + ,)"
      >
        ⚙
      </button>

      {showVersion && (
        <div className="version-tag">v1.75</div>
      )}

      {/* Settings Modal Engine */}
      <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          panelRadius={panelRadius}
          setPanelRadius={setPanelRadius}
          titlePosition={titlePosition}
          setTitlePosition={setTitlePosition}
          showVersion={showVersion}
          setShowVersion={setShowVersion}
          enableDragDrop={enableDragDrop}
          setEnableDragDrop={setEnableDragDrop}
          showActionButton={showActionButton}
          setShowActionButton={setShowActionButton}
          forceUppercase={forceUppercase}
          setForceUppercase={setForceUppercase}
          currentVideoSource={currentVideoSource}
          setCurrentVideoSource={setCurrentVideoSource}
          quadrantOrder={quadrantOrder}
          setQuadrantOrder={setQuadrantOrder}
      /> 

      {/* Main Layout Container */}
      <div className="dashboard">
        
        {/* Left Sidebar */}
        <Sidebar 
            height={dashboardStyle.height}
            showActionButton={showActionButton}
            enableDragDrop={enableDragDrop}
            forceUppercase={forceUppercase}
            deviceState={deviceState}
        />

        {/* Multiview Quadrants */}
        <main 
          className="quadrant-wrapper" 
          style={{ width: `${dashboardStyle.width}px`, height: `${dashboardStyle.height}px` }}
        >
          <QuadrantGrid 
              quadrantOrder={quadrantOrder}
              currentVideoSource={currentVideoSource}
              isConnected={isConnected}
              enableDragDrop={enableDragDrop}
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