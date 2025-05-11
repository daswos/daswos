import React, { useState, useEffect } from 'react';
import { ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useDasbar } from '@/contexts/dasbar-context';
import { useLocation } from 'wouter';
import DasWosHeaderLogo from '@/components/daswos-header-logo';

interface DasbarMoreMenuProps {
  className?: string;
}

const DasbarMoreMenu: React.FC<DasbarMoreMenuProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { collapsedItems, items } = useDasbar();
  const [, navigate] = useLocation();

  // Debug log to check if collapsedItems is working
  useEffect(() => {
    console.log("Collapsed items:", collapsedItems);
    console.log("All items:", items);
  }, [collapsedItems, items]);

  // Toggle the collapsed state of the Dasbar
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle navigation for collapsed buttons
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Apply the collapsed state to the Dasbar element
  useEffect(() => {
    const dasbar = document.querySelector('.dasbar');
    if (dasbar) {
      if (isCollapsed) {
        dasbar.classList.add('collapsed');
        // Create a container for the D button and collapsed buttons
        const containerElement = document.createElement('div');
        containerElement.id = 'dasbar-collapsed-container';
        containerElement.style.cssText = `
          position: fixed;
          left: 15px;
          bottom: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10000;
          gap: 15px;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        `;

        // Add the main button with DasWos logo
        const debugElement = document.createElement('div');
        debugElement.id = 'dasbar-debug';
        debugElement.title = "Expand Dasbar"; // Add tooltip
        debugElement.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          overflow: hidden;
          padding: 0;
          position: relative;
        `;

        // Create the DasWos logo SVG
        const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        logoSvg.setAttribute('width', '24');
        logoSvg.setAttribute('height', '24');
        logoSvg.setAttribute('viewBox', '0 0 40 40');

        // Create the logo rectangles
        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttribute('x', '0');
        rect1.setAttribute('y', '0');
        rect1.setAttribute('width', '20');
        rect1.setAttribute('height', '20');
        rect1.setAttribute('fill', 'black');

        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttribute('x', '2');
        rect2.setAttribute('y', '2');
        rect2.setAttribute('width', '16');
        rect2.setAttribute('height', '16');
        rect2.setAttribute('fill', 'white');

        const rect3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect3.setAttribute('x', '0');
        rect3.setAttribute('y', '22');
        rect3.setAttribute('width', '12');
        rect3.setAttribute('height', '12');
        rect3.setAttribute('fill', 'black');

        const rect4 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect4.setAttribute('x', '2');
        rect4.setAttribute('y', '24');
        rect4.setAttribute('width', '8');
        rect4.setAttribute('height', '8');
        rect4.setAttribute('fill', 'white');

        // Append all rectangles to the SVG
        logoSvg.appendChild(rect1);
        logoSvg.appendChild(rect2);
        logoSvg.appendChild(rect3);
        logoSvg.appendChild(rect4);

        // Append the SVG to the button
        debugElement.appendChild(logoSvg);
        debugElement.onclick = toggleCollapse;

        // Add the collapsed buttons first (they will be at the top)
        if (collapsedItems.length > 0) {
          collapsedItems.forEach(item => {
            const button = document.createElement('button');
            // Check if dark mode is enabled
            const isDarkMode = document.documentElement.classList.contains('dark');

            button.style.cssText = `
              width: 40px;
              height: 40px;
              background-color: ${isDarkMode ? '#333333' : '#f3f4f6'};
              color: ${isDarkMode ? 'white' : 'black'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 500;
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
              transition: all 0.2s ease;
              position: relative;
              z-index: 10000;
              margin: 0;
            `;

            // Create the icon based on the item ID
            const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            iconSvg.setAttribute('width', '20');
            iconSvg.setAttribute('height', '20');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.setAttribute('fill', 'none');
            iconSvg.setAttribute('stroke', 'currentColor');
            iconSvg.setAttribute('stroke-width', '2');
            iconSvg.setAttribute('stroke-linecap', 'round');
            iconSvg.setAttribute('stroke-linejoin', 'round');

            // Add the appropriate icon path based on the item ID
            switch (item.id) {
              case 'bulkbuy':
                // Shopping bag icon
                const bagPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                bagPath.setAttribute('d', 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z');
                const handlePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                handlePath.setAttribute('d', 'M16 10a4 4 0 01-8 0');
                iconSvg.appendChild(bagPath);
                iconSvg.appendChild(handlePath);
                break;
              case 'splitbuy':
                // Split icon (maximize-2)
                const splitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                splitPath.setAttribute('d', 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3');
                iconSvg.appendChild(splitPath);
                break;
              case 'daslist':
                // List icon
                const listPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                listPath.setAttribute('d', 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01');
                iconSvg.appendChild(listPath);
                break;
              case 'jobs':
                // Briefcase icon
                const briefcasePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                briefcasePath.setAttribute('d', 'M20 7h-4V3H8v4H4v14h16V7zm-8-2v2m-2 5h8');
                iconSvg.appendChild(briefcasePath);
                break;
              case 'ai-assistant':
                // Bot icon
                const botHead = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                botHead.setAttribute('x', '3');
                botHead.setAttribute('y', '11');
                botHead.setAttribute('width', '18');
                botHead.setAttribute('height', '11');
                botHead.setAttribute('rx', '2');
                botHead.setAttribute('ry', '2');

                const botEye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                botEye1.setAttribute('cx', '9');
                botEye1.setAttribute('cy', '16');
                botEye1.setAttribute('r', '1');

                const botEye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                botEye2.setAttribute('cx', '15');
                botEye2.setAttribute('cy', '16');
                botEye2.setAttribute('r', '1');

                const botAntenna = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                botAntenna.setAttribute('d', 'M12 7v4m-4-7h8');

                iconSvg.appendChild(botHead);
                iconSvg.appendChild(botEye1);
                iconSvg.appendChild(botEye2);
                iconSvg.appendChild(botAntenna);
                break;
              case 'cart':
                // Shopping cart icon
                const cartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                cartPath.setAttribute('d', 'M9 20a1 1 0 1 0 0 2 1 1 0 1 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63-.03.12a.25.25 0 0 0 .25.25H19');
                iconSvg.appendChild(cartPath);
                break;
              case 'daswos-coins':
                // Coin icon
                const coinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                coinCircle.setAttribute('cx', '12');
                coinCircle.setAttribute('cy', '12');
                coinCircle.setAttribute('r', '8');

                const coinLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                coinLine.setAttribute('d', 'M9.5 9.5h5v5h-5z');

                iconSvg.appendChild(coinCircle);
                iconSvg.appendChild(coinLine);
                break;
              default:
                // Default icon - first letter
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', '12');
                text.setAttribute('y', '16');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', 'currentColor');
                text.setAttribute('font-size', '14');
                text.textContent = item.label.charAt(0);
                iconSvg.appendChild(text);
            }

            button.appendChild(iconSvg);

            // Add tooltip
            button.title = item.label;

            // Add hover effect
            button.onmouseover = () => {
              const isDarkMode = document.documentElement.classList.contains('dark');
              button.style.backgroundColor = isDarkMode ? '#444444' : '#e5e7eb';
              button.style.transform = 'scale(1.05)';
            };

            button.onmouseout = () => {
              const isDarkMode = document.documentElement.classList.contains('dark');
              button.style.backgroundColor = isDarkMode ? '#333333' : '#f3f4f6';
              button.style.transform = 'scale(1)';
            };

            // Add click handler
            button.onclick = () => handleNavigation(item.path);

            // Add button directly to container
            containerElement.appendChild(button);
          });
        }

        // Add the DasWos logo button last (it will be at the bottom)
        containerElement.appendChild(debugElement);

        // Force a reflow to ensure the transition works
        void containerElement.offsetWidth;

        // Set opacity to 1 and add scale animation after a small delay to trigger the transition
        setTimeout(() => {
          containerElement.style.opacity = '1';
        }, 10);

        // Remove any existing container
        const existingContainer = document.getElementById('dasbar-collapsed-container');
        if (existingContainer) {
          document.body.removeChild(existingContainer);
        }

        document.body.appendChild(containerElement);
      } else {
        dasbar.classList.remove('collapsed');
        // Remove the container when expanded with a smooth transition
        const containerElement = document.getElementById('dasbar-collapsed-container');
        if (containerElement) {
          // Fade out the container
          containerElement.style.opacity = '0';

          // Remove after transition completes
          setTimeout(() => {
            if (document.body.contains(containerElement)) {
              document.body.removeChild(containerElement);
            }
          }, 400);
        }
      }
    }
  }, [isCollapsed]);

  return (
    <button
      onClick={toggleCollapse}
      className={`
        text-white transition-colors collapse-button
        ${isCollapsed ? 'collapsed-button' : ''}
        ${className}
      `}
      aria-label={isCollapsed ? "Expand Dasbar" : "Collapse Dasbar"}
      title={isCollapsed ? "Expand Dasbar" : "Collapse Dasbar"}
      style={{ position: 'relative' }}
    >
      {isCollapsed ? (
        <div className="dasbar-logo">
          <DasWosHeaderLogo size={24} />
        </div>
      ) : (
        <span className="dasbar-text">collapse</span>
      )}
      <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"}</span>
    </button>
  );
};

export default DasbarMoreMenu;
