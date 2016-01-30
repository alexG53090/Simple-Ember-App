define('super-rentals/components/rental-listing', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    isImageShowing: false,
    actions: {
      imageShow: function imageShow() {
        this.set('isImageShowing', true);
      },
      imageHide: function imageHide() {
        this.set('isImageShowing', false);
      }
    }
  });
});