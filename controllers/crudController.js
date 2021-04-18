exports.deleteItem = (Model) => async (request, response, next) => {
  try {
    const item = await Model.findByIdAndDelete(request.params.id);

    if (!item) {
      response.render('errors/404');
    }

    response.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
