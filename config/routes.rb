Empressa::Application.routes.draw do

  namespace :admin do
    root to: 'index#index'
    get 'letmeinpleaseimacat', to: 'index#enable_admin_access'
    get 'letmeinpleaseimadog', to: 'index#disable_admin_access'

    resources :countries
    resources :items
  end

  namespace :api, path: 'api' do
    get 'translations/get', to: 'translations#get'

    get 'cart/get', to: 'cart#get_cart'
    post 'cart/add_item', to: 'cart#add_item'
    post 'cart/remove_item', to: 'cart#remove_item'
  end

  #get "/" => "index#index"
  get "/" => "catalogue#index"
  #get "/catalogue" => "catalogue#index"
end
