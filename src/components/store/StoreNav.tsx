import { Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { useCart, useSession } from "@/lib/store";

const StoreNav = () => {
  const cart = useCart();
  const { user } = useSession();
  return (
    <div className="bg-muted border-b border-border">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm font-bold">
        <Link to="/produtos" className="hover:text-primary">Produtos e Serviços</Link>
        <div className="flex items-center gap-4">
          <Link to={user ? "/minha-conta" : "/entrar"} className="flex items-center gap-1 hover:text-primary">
            <User size={16} /> {user ? "Minha conta" : "Entrar"}
          </Link>
          <Link to="/carrinho" className="flex items-center gap-1 hover:text-primary">
            <ShoppingCart size={16} /> Carrinho ({cart.length})
          </Link>
        </div>
      </div>
    </div>
  );
};
export default StoreNav;
