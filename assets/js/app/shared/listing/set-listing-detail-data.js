define(['locale/strings', 'app/shared/config', 'util/dom'], function (Strings, Config, Dom) {

    var googleMapsImageUrl = '//maps.googleapis.com/maps/api/staticmap?&size=400x400&zoom=15&markers={markers}&key=' + Config().credentials.google.browser + (Dom.isTouchDevice ? '&scale=2' : '');
    var googleMapsUrl = 'https://maps.google.com/maps?daddr={location}';

    return function setListing(detail, listing, readonly) {
        var latLon = listing.location.coordinates.clone().reverse().join(',');
        listing.googleMapsImageUrl = googleMapsImageUrl.assign({ markers: latLon });
        listing.googleMapsUrl = googleMapsUrl.assign({ location: latLon });
        listing.readonly = readonly;
        detail.listing(listing);
        detail.images(listing.images.sortBy('sequence'));
        detail.activeImage(detail.images()[0]);
        if (!readonly) {
            detail.isFavorited(listing.favorers.any(function (favorer) { return favorer.id == Config().user.id; }));
            document.title = listing.title + ' ' + Strings('facebook.share.for.rent', { price: listing.price.daily }) + ' - ' + Strings('brand.name');
        }
    };

});
