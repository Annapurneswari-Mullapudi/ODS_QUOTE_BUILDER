import { createRoot } from 'react-dom/client'
import './src/index.css'
import AlbumSize from './src/pages/QuotationBuilder/AlbumSize.jsx'

createRoot(document.getElementById('root')).render(
  <AlbumSize
    onBack={() => console.log('back')}
    onNext={(albums) => console.log('next', JSON.stringify(albums))}
    cumulativeTotalPrice={100000}
    initialSelectedAlbums={[]}
    initialAlbumNotes={{}}
    isWeddingFlow={true}
  />
)
