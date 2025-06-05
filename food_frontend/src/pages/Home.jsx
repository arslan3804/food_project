import ProductList from '../components/products/ProductList'
import CategorySidebar from '../components/categories/CategorySidebar'

export default function Home() {
  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md-3 col-lg-2 mb-4 mb-md-0">
          <div className="sticky-top" style={{ top: '1rem', zIndex: 100 }}>
            <CategorySidebar />
          </div>
        </div>
        <div className="col-md-9 col-lg-10">
          <ProductList />
        </div>
      </div>
    </div>
  );
}
