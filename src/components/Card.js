import React from "react";

function Card({ title, description, onClick }) {
    return (
        <div
            className="bg-white rounded-xl shadow-lg p-6 w-72 hover:shadow-xl transition duration-300 cursor-pointer"
            onClick={onClick}
        >
            <h2 className="text-xl font-semibold text-olive-dark mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}

export default Card;
