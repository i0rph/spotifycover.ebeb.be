import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Test() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-7xl font-extrabold text-transparent">
        TEST PAGE
      </h1>
      <Button asChild>
        <Link to="/">HOME</Link>
      </Button>
    </div>
  );
}
