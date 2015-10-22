class TranslationsController < ApiController

  def get
    return (render json: {error: ''}, status: 400) if params[:key].nil?
  end

end
