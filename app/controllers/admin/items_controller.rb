class Admin::ItemsController < Admin::AdminController

  def index
    @items = Item.all
  end
  
  def new
    @item = Item.new
    @header = "+ Item"
    if params[:type].present?
      @header = "+ " + params[:type]
    end
    @link_back = admin_items_path
  end

  def edit
    @item = Item.find(params[:id])
    @header = "Редактирование " + @item.name
    @link_back = admin_items_path
  end

  def create
    @item = Item.new(item_params)
    @item.save!

    redirect_to admin_items_path
  end

  def update
    @item = Item.find(params[:id])
    @item.update_attributes(item_params)

    if params[:commit] == "Сохранить, перейти в список"
        redirect_to admin_items_path
    elsif params[:commit] == "Сохранить, остаться здесь"
        redirect_to edit_admin_item_path(@item)
    end
  end

  private

  def item_params
    params.require(:item).permit(:kind, :name, :url, :description, :price, :rating, :methods, :specs, :image, :image_plantation, :is_published)
  end

end