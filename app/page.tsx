import './globals.css';
import Menu from '../components/Menu';
export default function Home()  {
  return (
    <>
      <Menu />
      <div className="container mx-auto px-4">
        <h1 className="text-xl font-bold">Home Page</h1>
        <p>Welcome to our Next.js application!</p>
      </div>
    </>
  );
}

