import ProductList from '../components/products/ProductList'
import CategorySidebar from '../components/categories/CategorySidebar'

export default function Home() {
  return (
    <div className="container-fluid mt-4">
      <div className="row">
        
        <div className="col-md-2">
          <CategorySidebar />
        </div>
        <div className="col-md-10">
          <ProductList />
        </div>       
      </div>
    </div>
  );
}