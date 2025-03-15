import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Masonry from "react-masonry-css";
import axios from "axios";
import "./Showcase.css";

const API_URL = import.meta.env.VITE_API_URL;

const Showcase = () => {
  const { city: urlCity } = useParams();
  const city = urlCity || "barcelona";

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [seed, setSeed] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const limit = 500;

  // Función para obtener las imágenes
  const fetchImages = async (pageNumber) => {
    try {
      setIsLoading(true);
      const params = { action: "getRandomImages", page: pageNumber, limit, city };
      if (seed) params.seed = seed;
      const response = await axios.get(API_URL, { params });
      
      if (response.data && Array.isArray(response.data.images)) {
        if (!seed && response.data.seed) {
          setSeed(response.data.seed);
        }
        if (pageNumber === 1) {
          setImages(response.data.images);
        } else {
          setImages((prev) => [...prev, ...response.data.images]);
        }
        if (response.data.images.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reinicia la paginación y las imágenes si cambia la ciudad
    setPage(1);
    setHasMore(true);
    setSeed(null);
    fetchImages(1);
  }, [city]);

  const loadMoreImages = () => {
    const nextPage = page + 1;
    fetchImages(nextPage);
    setPage(nextPage);
  };

  // Manejo del clic en la imagen: selecciona/deselecciona
  const handleImageClick = (id) => {
    console.log("Imagen clickeada:", id);
    setSelectedImageId(selectedImageId === id ? null : id);
  };
  

  const breakpointColumnsObj = {
    default: 4,
    1024: 3,
    768: 2,
    480: 1,
  };

  return (
    <>
      {isLoading && images.length === 0 && (
        <div className="loading-overlay">
          <div className="loading-text">Loading</div>
        </div>
      )}

      <div
        className="showcase-container"
        style={{ display: images.length === 0 && isLoading ? "none" : "block" }}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {images.map((img) => (
            <div
              key={img.id}
              className="masonry-item"
              onClick={() => handleImageClick(img.id)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <img
                src={img.public_url}
                alt={img.original_name}
                loading="lazy"
                style={{
                  filter: selectedImageId === img.id ? "brightness(0.3)" : "none",
                }}
              />
              {selectedImageId === img.id && (
                <div className="overlay">
                  {img.original_name}
                </div>
              )}
            </div>
          ))}
        </Masonry>
        {hasMore && (
          <div className="load-more-container">
            <button
              className="load-more-button"
              onClick={loadMoreImages}
              disabled={isLoading}
            >
              <img src="/more.png" alt="Cargar más imágenes" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Showcase;
