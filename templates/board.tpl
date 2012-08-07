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
% for list in lists:
    <div class="list" id="{{list['name']}}">
      <div class="list-header">{{list['label']}}</div>
      <div class="list-body">
% for card in list['cards']:
        <div class="card" id="{{card['name']}}">
            {{card['desc']}}
        </div>
% end
      </div>
      <div class="add-machinery">
        <form>
          <textarea rows=3></textarea>
          <button type="submit">Add</button>
          <button type="reset">Cancel</button>
        </form>
      </div>
      <div class="list-footer">Add a card...</div>
    </div>
% end
  </div>
</html>
