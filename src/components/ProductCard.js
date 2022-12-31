import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        image={product.image}
        alt={product.name}
        className="card-img"
      />
      <CardContent className="card-content">
        <h3>{product.name}</h3>
        <h3>${product.cost}</h3>
        <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>

      <CardActions className="card-actions">
        <Button
          className="card-button"
          variant="contained"
          onClick={handleAddToCart}
          fullWidth
        >
          <AddShoppingCartOutlined />
          <Typography color="common.white">add to cart</Typography>
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
