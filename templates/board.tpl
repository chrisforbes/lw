<!doctype html>
<html>
  <title>Lightweight Process Machine</title>
  <script src="static/js/jquery-1.7.2.min.js"></script>
  <script src="static/js/jquery-ui-1.8.22.custom.min.js"></script>
  <script src="static/js/app.js"></script>
  <link rel="stylesheet" href="static/css/ui-lightness/jquery-ui-1.8.22.custom.css" />
  <link rel="stylesheet" href="static/css/app.css" />

  <div id="nav">
  </div>

  <div id="main">
  </div>

  <div id="templates">
    <div class="list" id="list-template">
      <div class="list-header"></div>
      <div class="list-body">
      </div>
      <div class="add-machinery">
          <textarea rows=3></textarea><br/>
          <button type="submit">Add</button>
          <button type="reset">Cancel</button>
      </div>
      <div class="list-footer">Add a card...</div>
    </div>

    <div class="card" id="card-template">
    </div>
  </div>
</html>
