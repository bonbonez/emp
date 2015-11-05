module CartHelper

  def get_cart_id_from_cookie
    return cookies[:cart_id].present? ? cookies[:cart_id] : nil
  end

  def get_user_cart
    id = get_cart_id_from_cookie
    if id.present?
      cart = Cart.find_by_cookie_id(id)
      if !cart
        cart = Cart.create
        cookies[:cart_id] = cart.cookie_id
      end
    else
      cart = Cart.create
      cookies[:cart_id] = cart.cookie_id
    end

    cart
  end

  def save_cart_id_to_cookie(cookie_id)
    cookies[:cart_id] = cookie_id
  end

end