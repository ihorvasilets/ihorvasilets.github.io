//------------------------ Authorization Module --------------------------
//------------------------------------------------------------------------
var clientId = '805860007508-kq670fbndvvnn35mk9dl2tl9qnmqu33q.apps.googleusercontent.com';

if (!/^([0-9])$/.test(clientId[0])) {
alert('Invalid Client ID - did you forget to insert your application Client ID?');
}

// Create a new instance of the realtime utility with your client ID.
var realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });

authorize();

function authorize() {
    // Attempt to authorize
    realtimeUtils.authorize(function(response){
        response.error = true;
        if(response.error){
        // Authorization failed because this is the first time the user has used your application,
        // show the authorize button to prompt them to authorize manually.
        var button = document.getElementById('auth_button');
        var authPanel = document.querySelectorAll('div.alert.alert-info')[0];
        authPanel.classList.add('visible');
        button.addEventListener('click', function () {
            realtimeUtils.authorize(function(response){
                start();
            }, true);

            authPanel.classList.remove('visible');
        });

        } else {
            start();
        }
    }, false);
}


//------------------------- Creating a document --------------------------
//------------------------------------------------------------------------
function start() {
    // With auth taken care of, load a file, or create one if there
    // is not an id in the URL.
    var id = realtimeUtils.getParam('id');
    
    if (id) {
        // Load the document id from the URL
        realtimeUtils.load(id.replace('/', ''), onFileLoaded, onFileInitialize);
        
    } else {
        // Create a new document, add it to the URL
        realtimeUtils.createRealtimeFile('New Quickstart File', function(createResponse) {
        window.history.pushState(null, null, '?id=' + createResponse.id);
        realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
        });
    }
}


//------------------------- Model initialization -------------------------
//------------------------------------------------------------------------

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model) {
    var string = model.createString();
    var list = model.createList();

    string.setText('Test task');
    list.insert(0, string);

    model.getRoot().set('coll_list', list);
}


//------------------------- On file loaded -------------------------
//------------------------------------------------------------------------

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc) {
    var collabList = doc.getModel().getRoot().get('coll_list');
    wireTextBoxes(collabList);
    
    //-------- addTask button  
    var button = document.getElementById('addTask');
    button.addEventListener('click', function () {

        var newTask = doc.getModel().createString();
        var newTaskText = document.getElementById("newTaskText");
        newTask.setText(newTaskText.value);
        newTaskText.value = '';
        newTaskText.placeholder = 'Write your text here..';

        collabList.push(newTask); 
    });

    //-------- onValuesAdded action (draw item)  
    collabList.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, function(){
        var length1 = collabList.asArray().length;
        drawTask(length1-1, collabList);
    });
    
    //-------- onValuesRemoved action (redraw list)  
    collabList.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, function(){redraw(collabList)});  
}

//------------------------ Drawing DOM-elements  -------------------------
//------------------------------------------------------------------------
  
function drawTask(i){
      
    var taskList = arguments[1];
    //console.log(arguments[1]);
    var task = document.createElement('div');
    task.classList.add('form-group', 'row');
    taskContainer.appendChild(task);

        var col1 = document.createElement('div');
        col1.classList.add('col-xs-10', 'col-sm-11');
        task.appendChild(col1);

            var inpGroup = document.createElement('div');
            inpGroup.classList.add('input-group', 'input-group-lg');
            col1.appendChild(inpGroup);

                var span1 = document.createElement('span');
                span1.classList.add('input-group-addon');
                span1.id = "sizing-addon1";
                inpGroup.appendChild(span1);
    
                var container = document.getElementById('taskContainer');
                span1.addEventListener('mousedown', function(event){
                    dragDrop(event, container, taskList);
                });
                span1.addEventListener('touchstart', function(event){
                    event.preventDefault();
                    dragDrop(event, container, taskList);
                });

//                    var span2 = document.createElement('span');
//                    span2.classList.add('glyphicon', 'glyphicon-move');
//                    span1.appendChild(span2);

                var inputField = document.createElement("input");
                gapi.drive.realtime.databinding.bindString(doc.getModel().getRoot().get('coll_list').get(i), inputField);
                inputField.type = "text";
                inputField.placeholder = 'Empty task';
                inputField.classList.add('form-control');
                inputField.ariaDescribedby = 'sizing-addon1';
                inpGroup.appendChild(inputField);

        var col2 = document.createElement('div');
        col2.classList.add('col-xs-2', 'col-sm-1');
        task.appendChild(col2);

            var delButton = document.createElement("button");
            delButton.type = 'submit';
            delButton.classList.add('btn', 'btn-default', 'btn-lg');
            delButton.dataset.listIndex = i;
            //-------- removing item from list:
            delButton.addEventListener('click', function(){
                var delInd = delButton.dataset.listIndex;
                taskList.remove(+delInd);
            });

            col2.appendChild(delButton);

                var spanBtn = document.createElement('span');
                spanBtn.classList.add('glyphicon');
//                spanBtn.innerHTML = 'Delete';
                delButton.appendChild(spanBtn);
}


//-------------------------- Drag & drop tasks ---------------------------
//------------------------------------------------------------------------

var aa = 0;
var timerId = setInterval(function() {
  aa = aa + 1;
}, 200);


function dragDrop(event, container, taskList){
//    if(event.path.length == 12){
        var movingItem = event.target.parentElement.parentElement.parentElement;
        var target = event.target;
        var delBtn = movingItem.children[1].children[0]
//}
//    else{
//        var movingItem = event.target.parentElement.parentElement.parentElement.parentElement;
//        var target = event.target.parentElement;
//    }
    movingItem.style.position = 'absolute';
    delBtn.style.visibility = 'hidden';
    movingItem.style.zIndex = '1000';

    function moveAt(event){
        movingItem.style.left = event.pageX + 'px';                    
        movingItem.style.top = event.pageY + 'px';
        //console.log(movingItem.getBoundingClientRect().top);
    }
    
     function moveAtTouch(event){
        movingItem.style.left = event.changedTouches[0].clientX + 'px';  
         //console.log(event.changedTouches[0].clientX + ' y' + event.changedTouches[0].clientY);
         console.log(event.changedTouches[0]);
        movingItem.style.top = event.changedTouches[0].clientY + window.pageYOffset + 'px';
        //console.log(movingItem.getBoundingClientRect().top);
    }

    
    document.addEventListener('touchmove', touchMove);
    document.addEventListener('mousemove', mouseMove);
        
        
        
    function touchMove (event){
        moveAtTouch(event, aa); 
    }

    function mouseMove (event){
        moveAt(event); 
    }
    
    
    document.addEventListener('touchend', touchEnd);
    document.addEventListener('mouseup', touchEnd);
    
    
    function touchEnd(){
        
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('mousemove', touchMove);
        
        var children = movingItem.parentElement.children;
        console.log('children: ' + movingItem.parentElement.children);
        var targetCoords = movingItem.getBoundingClientRect().top;
        
        var to = children.length;
        for (var j = 0; j < children.length; j++){
            console.log('j[' + j + '] ' + children[j].getBoundingClientRect().top);
            if(children[j].getBoundingClientRect().top > targetCoords){
                to = j;
                break;
            }
        }

        var from = movingItem.children[1].children[0].dataset.listIndex;

        if(to < children.length - 1)
            container.insertBefore(movingItem, container.children[+to+1]);
        else
            container.appendChild(movingItem);

        movingItem.style.position = 'static';
         delBtn.style.visibility = 'visible';
        taskList.move(+from, +to);
    }
}


//-------------------------- Redrawing of list ---------------------------
//------------------------------------------------------------------------

function redraw(collabList){
            var clr = document.querySelectorAll('div#taskContainer')[0];
            clr.innerHTML = '';
            wireTextBoxes(collabList);
}


//------------------- Loading of available list items --------------------
//------------------------------------------------------------------------

// Connects the text boxes to the collaborative string
function wireTextBoxes(collList) {
    var len = collList.asArray().length;

    for(var i = 0; i < len; i++){
      drawTask(i, collList);
    }
}