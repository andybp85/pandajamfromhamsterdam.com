$(function(){

  function sizes(e, callback){
    var wrapper = $('#wrapper'),
        logo = $('#logo'),
        logo_from = $('#logo_from'),
        marginSize = $('#inner_header').height() + ( window.innerWidth < 440 ? 10 : 30 + $('#menu-row').height() );

    wrapper.height(window.innerHeight);

    $('#music_background').css({
      'margin-top': marginSize,
      'height': this.innerHeight - marginSize - 25
      });

    if (window.innerWidth > 768 && wrapper.hasClass('toggled'))
        wrapper.removeClass('toggled');

//     if (window.innerWidth < 441) {
//       var margin = (window.innerWidth - logo.width()) / 3;
//       logo.css('margin-left', margin);
//       logo_from.css('left', ( $('#logo').width() * .9) + margin - logo_from.width());
//     } else {
//       logo.css('margin-left', 'auto');
//     }

    if (callback != null)
      setTimeout(callback, 500);
   
  }

  sizes(null, function(){
    $('#music_background').css('border-top', '2px solid #555');
    $('#home_content').css('display','block');
  }); 

  $( window ).resize(sizes);

  var allmeta = {};

  function loadContent(e) {

    var jamplayer = $('#jamplayer'),
        jamdeetz = $('#jamdeetz'),
        wrapper = $('#wrapper');

    if (wrapper.hasClass('toggled'))
        wrapper.removeClass('toggled');

    if (window.location.hash.substr(1) == "") {
      jamplayer.html('');
      jamdeetz.html('');
      jamplayer.removeClass('loading');
      $('#home_content').css('display','block');

    } else {
      
        $('#home_content').css('display','none');
        jamplayer.html('');
        jamplayer.html('<iframe src="https://archive.org/embed/' + window.location.hash.substr(1) + '&playlist=1" width="' + (window.innerHeight < 600 ? 300 : 350) + '" height="' + (window.innerHeight < 600 ? 200 : 300) + '" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe>');

    //     if (window.innerHeght < 600)
    //       jamplayer.css('height',250);

        jamplayer.addClass('loading');
        jamplayer.children('iframe').load(function(e) {
          jamplayer.removeClass('loading');
        });
        jamdeetz.html( allmeta[window.location.hash.substr(1)].description );
    //     $('#music_background').css('height', height);
        $('#music_background_inner').css('height', jamplayer.innerHeight() + jamdeetz.innerHeight() + 60);
  }
}

  $.getJSON( 'https://archive.org/advancedsearch.php?q=creator%3A%22PandaJAM+From+HamsterDAM%22&fl%5B%5D=identifier&sort%5B%5D=date+desc&sort%5B%5D=&sort%5B%5D=&rows=500&page=1&output=json&callback=?', function(alldata) {

    var jam_list = $('#jam_list'),
      dates = [],
      allmetaByDate = {};

    jam_list.append('<img id="loading-jams" src="//pandajamfromhamsterdam.com/img/loading7_gray.gif" />');

    alldata.response.docs.forEach(function(d) {
      $.getJSON( 'https://archive.org/metadata/' + d.identifier + '&callback=?', function(onedata) {

//         if (Object.getOwnPropertyNames(allmeta).length == 0) {
//           jam_list.append('<li class="jam_link"><a href="#' + onedata.metadata.identifier + '">' + onedata.metadata.date + '</a></li>' );
//         } else {
//           $('.jam_link').each(function() {
//             if (onedata.metadata.date < this.innerText) 
//               $(this).before('<li class="jam_link"><a href="#' + onedata.metadata.identifier + '">' + onedata.metadata.date + '</a></li>' );
//           });
//         }

        allmeta[d.identifier] = onedata.metadata;
        allmetaByDate[onedata.metadata.date] = onedata.metadata;
        dates.push(onedata.metadata.date);

        if (alldata.response.docs.length === dates.length) {

          $('#loading-jams').remove();
          $('ul#jam_list').removeClass('loading');

          dates.sort();
          
          for (var i = dates.length; i > 0 ; i--) {
              jam_list.append('<li class="jam_link"><a href="#' + allmetaByDate[dates[i-1]].identifier + '">' + dates[i-1] + '</a><div class="jam_seperator"></div></li>' );
            }

          if (window.location.hash !== "") {
            loadContent();
          }
          
        }
        
      });
     
    });

  });

  $(window).bind( 'hashchange', loadContent);

});
