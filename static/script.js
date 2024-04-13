function getAbsolutePosition(elem) {
  var r = elem.getBoundingClientRect();
  return {
    top: r.top + window.scrollY,
    bottom: r.bottom + window.scrollY
  }
}

function getAbsoluteTop(elem) {
  return getAbsolutePosition(elem).top
}

(function() {
  var $body = document.body;
  var $pgHolder = document.getElementById("playground-holder");
  var $pg = document.getElementById("playground");
  var $storyEach = document.getElementById("story-each");
  var $storyTogether = document.getElementById("story-together");

  var $jyThumb = document.getElementById("sonia-thumb");
  var $jyIcon = $jyThumb.children[0];
  var $jyContents = Array.from(document.getElementsByClassName("content sonia"));
  var $syThumb = document.getElementById("michele-thumb");
  var $syIcon = $syThumb.children[0];
  var $syContents = Array.from(document.getElementsByClassName("content michele"));
  var $togetherContent = document.getElementsByClassName("content together")[0];

  var jyIconHolders = ['baby', 'girl', 'woman', 'couple'];
  var syIconHolders = ['baby', 'boy', 'man', 'couple'];

  function updatePlayground(e) {
    // Playground Holder
    var pgHolderPosition = getAbsolutePosition($pgHolder);

    // Story
    var storyEachToken = "on-story-each";
    var storyAfterToken = "after-story-each";
    var storyEachDecider = window.innerHeight + window.scrollY;
    var storyEachPosition = getAbsolutePosition($storyEach);
    if (storyEachDecider > storyEachPosition.top + 1 && storyEachDecider <= pgHolderPosition.bottom) {
      $body.classList.add(storyEachToken);
      $body.classList.remove(storyAfterToken);
    } else if (storyEachDecider > pgHolderPosition.bottom) {
      $body.classList.remove(storyEachToken);
      $body.classList.add(storyAfterToken);
    } else {
      $body.classList.remove(storyEachToken);
      $body.classList.remove(storyAfterToken);
     }

    var togetherContentTop = getAbsoluteTop($togetherContent);

    var jyTops = $jyContents.map(getAbsoluteTop);
    var jyLevel = jyTops.findLastIndex(function(value) { return value < storyEachDecider; });
    $jyIcon.classList.remove(...jyIconHolders);
    if (jyLevel < 0) {
      $jyThumb.style.display = "none";
      $jyThumb.style.left = 0;
      $jyThumb.style.transform = "none";
      $jyIcon.classList.add(jyIconHolders[0]);
    } else if (storyEachDecider >= togetherContentTop) {
      $syThumb.style.display = "block";
      $jyThumb.style.left = "50%";
      $jyThumb.style.transform = "translateX(-50%)";
      $jyIcon.classList.add(jyIconHolders[jyIconHolders.length - 1]);
    } else {
      $jyThumb.style.display = "block";
      $jyThumb.style.left = jyLevel / (jyTops.length * 2) * 100 + "%";
      $jyThumb.style.transform = "none";
      $jyIcon.classList.add(jyIconHolders[jyLevel]);
    }

    var syTops = $syContents.map(getAbsoluteTop);
    var syLevel = syTops.findLastIndex(function(value) { return value < storyEachDecider; });
    $syIcon.classList.remove(...syIconHolders);
    if (syLevel < 0) {
      $syThumb.style.display = "none";
      $syThumb.style.right = 0;
      $syThumb.style.transform = "none";
      $syIcon.classList.add(syIconHolders[0]);
    } else if (storyEachDecider >= togetherContentTop) {
      $syThumb.style.display = "block";
      $syThumb.style.right = "50%";
      $syThumb.style.transform = "translateX(50%)";
      $syIcon.classList.add(syIconHolders[syIconHolders.length - 1]);
    } else {
      $syThumb.style.display = "block";
      $syThumb.style.right = syLevel / (syTops.length * 2) * 100 + "%";
      $syThumb.style.transform = "none";
      $syIcon.classList.add(syIconHolders[syLevel]);
    }
  }

  var $photosetRows = Array.from(document.getElementsByClassName("photoset-row"));
  var photoMargin = 2;
  function resizeImages(e) {
    $photosetRows.forEach(function($row) {
      var $photoSet = $row.parentNode,
          wholeWidth = $photoSet.offsetWidth,
          n = $row.children.length,
          exactWidth = wholeWidth - (n - 1) * 2 * photoMargin,
          $images = [],
          totalRatio = 0;

      Array.from($row.children).forEach(function($figure) {
        var image = $figure.children[0].children[0];
        totalRatio += parseFloat(image.getAttribute("data-ratio"));
        $images.push(image);
      });

      $images.forEach(function($image) {
        var ratio = parseFloat($image.getAttribute("data-ratio"));
        var width = exactWidth * ratio / totalRatio;
        $image.width = width;
        $image.height = width / ratio;
        $image.src = $image.getAttribute("data-src");

        var parent = $image.parentNode;
        parent.dataset.pswpWidth = wholeWidth;
        parent.dataset.pswpHeight = wholeWidth / ratio;
      });
    });
  }

  var throttler;
  function throttle(e, func) {
    if (!throttler) {
      throttler = setTimeout(function() {
        throttler = null;
        func(e)
      }, 66) // 15fps
    }
  }

  document.addEventListener("scroll", function(e) {
    throttle(e, updatePlayground);
  });

  window.addEventListener("resize", function(e) {
    throttle(e, function(e2) {
      resizeImages(e2);
      updatePlayground(e2);
    });
  });

  document.addEventListener("DOMContentLoaded", function(e) {
    throttle(e, function(e2) {
      resizeImages(e2);
      updatePlayground(e2);
    });
  });

  // goto
  document.addEventListener('click', function(e) {
    if (!e.target) { return }

    var $a = e.target.closest('a');
    if (!$a) { return }


    if ($a.classList.contains('go-to')) {
      e.preventDefault();

      var href = $a.getAttribute('href');
      var marginTop = $a.getAttribute('data-margin-top');
      var $target = document.getElementById(href.replace('#', ''));
      if ($target) {
        var targetTop = getAbsolutePosition($target).top;
        if (marginTop) { targetTop -= parseFloat(marginTop) }

        scroll({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    } else if ($a.classList.contains('share')) {
      e.preventDefault();
      window.navigator.share({
        title: '2022.10.01. 이재영♥조소영 결혼합니다',
        text: '2022년 10월 1일\n이재영 ♥ 조소영 결혼합니다.\n\n서로를 보듬어주고 지켜주며 다져온 인연을\n이제는 부부로서 이어가고자 합니다.\n눈부시게 푸르른 가을 하늘 아래\n새로이 함께하는 저희 두 사람의 모습을\n축복의 박수로 격려 부탁드립니다.\n\n2022년 10월 1일\n서초 더화이트베일 V홀',
        url: 'https://rosy.day',
      });
    }
  });

}).call(this);
