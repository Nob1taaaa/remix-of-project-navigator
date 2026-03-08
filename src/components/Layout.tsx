import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
