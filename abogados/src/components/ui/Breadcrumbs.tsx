// Breadcrumb Component
// Navigation breadcrumb with dynamic routes

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homePath?: string;
}

export function Breadcrumbs({ items, homePath = '/dashboard' }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link
        to={homePath}
        className="text-theme-muted hover:text-theme-primary transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-theme-muted" />
            
            {isLast || !item.path ? (
              <span className="text-theme-primary font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-theme-muted hover:text-theme-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Hook para generar breadcrumbs automáticamente
import { useLocation } from 'react-router-dom';

export function useBreadcrumbs() {
  const location = useLocation();
  
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = pathParts.map((part, index) => {
    const path = `/${pathParts.slice(0, index + 1).join('/')}`;
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      label,
      path: index < pathParts.length - 1 ? path : undefined
    };
  });
  
  return breadcrumbs;
}

export default Breadcrumbs;
