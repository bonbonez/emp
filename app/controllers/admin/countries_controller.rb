class Admin::CountriesController < Admin::AdminController

  def index
    @countries = Country.all
  end
  
  def new
    @country = Country.new
    @header = "New Country"
    @link_back = admin_countries_path
  end

  def edit
    @country = Country.find(params[:id])
    @header = "Edit Country"
    @link_back = admin_countries_path
  end

  def create
    @country = Country.new(country_params)
    @country.save!

    redirect_to admin_countries_path
  end

  def update
    @country = Country.find(params[:id])
    @country.update_attributes(country_params)

    redirect_to admin_countries_path
  end

  private

  def country_params
    params.require(:country).permit(:name, :flag)
  end

end