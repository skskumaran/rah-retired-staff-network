import React from 'react';

const NewsCard = ({ article }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
    {article.image && (
      <img 
        <img 
        src={article.image ? article.image.replace(/^http:/, 'https:') : 'https://placehold.co/600x400/EFEFEF/AAAAAA&text=No+Image'} 
        alt={article.headline} 
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/EFEFEF/AAAAAA&text=No+Image'; }}
      />
        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/EFEFEF/AAAAAA&text=No+Image'; }}
      />
    )}
    <div className="p-6">
      <h3 className="text-xl font-bold text-indigo-800 mb-2">{article.headline}</h3>
      <p className="text-gray-600 text-sm mb-4">{new Date(article.date).toLocaleDateString('en-AU')}</p>
      <p className="text-gray-700 leading-relaxed">{article.content}</p>
    </div>
  </div>
);

export default NewsCard;