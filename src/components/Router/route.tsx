import { useRouter } from "../../hooks/useRouter";

export const Router: React.FC = () => {
    const { currentPath, routes } = useRouter();
    const CurrentComponent = routes.find(route => route.path === currentPath)?.component;

    if (!CurrentComponent) {
        return <div>404 Not Found</div>;
    }

    return <CurrentComponent />;
};

// Link component for navigation
export const Link: React.FC<{ to: string; children: React.ReactNode, className: string }> = ({ to, children, className }) => {
    const { navigate } = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(to);
    };

    return (
        <a href={to} onClick={handleClick} className={className}>
            {children}
        </a>
    );
};