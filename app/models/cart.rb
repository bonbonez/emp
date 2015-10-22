class Cart < ActiveRecord::Base
  before_save :generate_unique_cookie_id, :ensure_data_not_empty

  def get_data
    d = self.data
    return data_dummy if d.nil?

    begin
      result = ActiveSupport::JSON.decode(d)
    rescue
      result = data_dummy
    end
    result
  end

  def set_data(obj)
    d = obj.to_json.to_s
    #d = ActiveSupport::Base64.encode64(d)
    self.data = d
    self.save
  end

  def add_item(item_data)
    return inc_item(item_data) if item_exists?(item_data)
    d = get_data
    d["items"].push({
      item_id: item_data["item_id"],
      amount: item_data["amount"],
      grind: item_data["grind"],
      count: 1
    })
    set_data(d)
  end

  def remove_item(item_data)
    return nil if !item_exists?(item_data)
    data = get_data
    data["items"].delete_at(get_item_index(item_data))
    set_data(data)
  end

  def inc_item(item_data)
    return if !item_exists?(item_data)
    data = get_data
    data["items"][get_item_index(item_data)]["count"] += 1
    set_data(data)
  end

  def dec_item(item_data)
    data = get_data
    count = (data["items"][get_item_index(item_data)]["count"] -= 1)
    return remove_item(item_data) if count < 1
    set_data(data)
  end

  def item_exists?(item_data)
    d = get_data
    return get_item(item_data).present?
  end

  def get_item(item_data)
    d = get_data
    d["items"].find{|item| item["item_id"] == item_data["item_id"] && item["amount"] == item_data["amount"] && item["grind"].to_sym == item_data["grind"].to_sym }
  end

  def get_item_index(item_data)
    d = get_data
    d["items"].index{|item| item["item_id"] == item_data["item_id"] && item["amount"] == item_data["amount"] && item["grind"].to_sym == item_data["grind"].to_sym }
  end

  def generate_unique_cookie_id
    if self.cookie_id.nil?
      self.cookie_id = loop do
        random_token = SecureRandom.urlsafe_base64(nil, false)
        break random_token unless Cart.exists?(cookie_id: random_token)
      end
    end
  end

  def ensure_data_not_empty
    if self.data.nil?
      self.data = data_dummy.to_json
    end
  end

  def data_dummy
    return {
      "items" => [],
      "total_price" => 0
    }
  end
end
