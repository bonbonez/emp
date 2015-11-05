class Api::CartController < ActionController::Base

  include CartHelper

  def get_cart
    cart = get_user_cart
    render status: 400 if !cart

    render_cart
  end

  def add_item
    cart = get_user_cart
    render status: 400 if !cart
    render status: 400 if !params[:item_id] || !params[:weight] || !params[:grind]

    cart.add_item(params[:item_id], params[:weight], params[:grind])
    render_cart
  end

  def remove_item
    cart = get_user_cart
    render status: 400 if !cart
    render status: 400 if !params[:item_id] || !params[:weight] || !params[:grind]

    cart.remove_item(params[:item_id], params[:weight], params[:grind])
    render_cart
  end

  def render_cart
    cart = get_user_cart
    render json: cart.to_json(include: {order_items: {include: :item}})
  end


end