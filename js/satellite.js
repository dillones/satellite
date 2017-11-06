function Satellite(camera){

  document.addEventListener("contextmenu", function(e){
      e.preventDefault();
  }, false);

  var scope = this;
  var multi = false;

  this.camera = camera;

  this.PRIMARY_CLICK = false;
  this.SECONDARY_CLICK = false;

  this.TOUCH = false;

  this.TOUCHES = [];
  this.LAST = [];

  this.mode = 0;

  for ( var i = 0; i < 2; i++ ){
  scope.TOUCHES[i] = new THREE.Vector3();
  this.LAST[i]  = new THREE.Vector3();
  }

  this.direct = new THREE.Vector3();

  this.roll    = new THREE.Vector3( 0.0, 0.0, 1.0);
  this.yaw     = new THREE.Vector3( 0.0,-1.0, 0.0);
  this.pitch   = new THREE.Vector3(-1.0, 0.0, 0.0);

  this.target  = new THREE.Vector3(0,0,0);
  this.z       = 0;

  this.pitch_vel = 0;
  this.roll_vel  = 0;
  this.yaw_vel   = 0;

  this.damp = 0.5;
  this.acc  = 0.0045;

  this.update = function(){

    if ( scope.PRIMARY_CLICK || scope.TOUCH ){
      this.yaw_vel   = this.direct.x * this.acc;
      this.pitch_vel = this.direct.y * this.acc;
    }
    else {
      this.yaw_vel *= .9;
      this.pitch_vel *= .9;
    }
    if ( scope.SECONDARY_CLICK ){
      this.roll_vel   = this.direct.x * this.acc;
      this.z = this.direct.y;
    }
    else{
      this.roll_vel *= .88;
    }

      this.z *= 0.5;

      var fov = this.camera.fov + this.z;
      if ( fov >= 30 && fov <= 120 ){
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }
      else if ( fov < 30 ){
        this.camera.fov = 30;
        this.camera.updateProjectionMatrix();
      }
      else if ( fov > 120 ){
        this.camera.fov = 120;
        this.camera.updateProjectionMatrix();
      }

    this.pitch.applyAxisAngle(this.yaw, this.yaw_vel);
    this.pitch.applyAxisAngle(this.roll, this.roll_vel);

    this.roll.applyAxisAngle(this.pitch, this.pitch_vel);
    this.roll.applyAxisAngle(this.yaw, this.yaw_vel);

    this.yaw.applyAxisAngle(this.pitch, this.pitch_vel);
    this.yaw.applyAxisAngle(this.roll, this.roll_vel);

    this.camera.up.applyAxisAngle(this.pitch,this.pitch_vel);
    this.camera.up.applyAxisAngle(this.roll,this.roll_vel);
    this.camera.up.applyAxisAngle(this.yaw,this.yaw_vel);

    this.camera.position.applyAxisAngle(this.pitch,this.pitch_vel);
    this.camera.position.applyAxisAngle(this.roll,this.roll_vel);
    this.camera.position.applyAxisAngle(this.yaw,this.yaw_vel);

    this.camera.lookAt(this.target);

    if ( this.direct.length() > 0.001 ){
      this.direct.multiplyScalar(0.8);
    }
    else {
      this.direct.set(0,0,0);
    }

    if ( Math.abs(this.z) > 0.001 ){
      this.z *= 0.99;
    }
    else {
      this.z = 0;
    }
  }

  this.start = function(event){
    switch ( event.touches.length ){
      case 1:
        scope.TOUCHES[0].set(event.touches[0].clientX, event.touches[0].clientY, 0);
        scope.LAST[0].copy(scope.TOUCHES[0]);
        multi = false;
        scope.TOUCH = true;
      break;
      case 2:
        for ( var i = 0; i < scope.TOUCHES.length; i++ ){
          scope.TOUCHES[i].set(event.touches[i].clientX, event.touches[i].clientY, 0);
          scope.LAST[i].copy(scope.TOUCHES[i]);
        }
        multi = true;
      break;
    }
  }

  this.move = function(event){
    switch ( event.touches.length ){
      case 1:
      if( !multi ){
        scope.TOUCHES[0].set(event.touches[0].clientX, event.touches[0].clientY, 0);
        scope.direct.copy(scope.TOUCHES[0]);
        scope.direct.sub(scope.LAST[0]);
        scope.LAST[0].copy(scope.TOUCHES[0]);
      }
      else{
        scope.TOUCHES[0].set(event.touches[0].clientX, event.touches[0].clientY, 0);
        scope.LAST[0].copy(scope.TOUCHES[0]);
        multi = false;
      }
      break;
      case 2:
      scope.TOUCHES[0].set(event.touches[0].clientX, event.touches[0].clientY, 0);
      scope.TOUCHES[1].set(event.touches[1].clientX, event.touches[1].clientY, 0);

      var d1 = scope.TOUCHES[0].distanceTo(scope.TOUCHES[1]);
      var d2 = scope.LAST[0].distanceTo(scope.LAST[1]);

      scope.z = Math.round(d2 - d1);

      for ( var i = 0; i < scope.TOUCHES.length; i++ ){
        scope.LAST[i].copy(scope.TOUCHES[i]);
      }
      break;
  }
  }

  this.release = function(event){
    scope.TOUCH = false;
  }

  this.mousedown = function(event){

    scope.TOUCHES[0].set(event.clientX, event.clientY, 0);
    scope.LAST[0].copy(scope.TOUCHES[0]);
    switch( event.button ){
      case(0):
      scope.PRIMARY_CLICK = true;
      break;
      case(2):
      scope.SECONDARY_CLICK = true;
      break;
    }
  }

  this.mousemove = function(event){
    if ( scope.PRIMARY_CLICK == true || scope.SECONDARY_CLICK == true ){
      scope.TOUCHES[0].set(event.clientX, event.clientY, 0);
      scope.direct.copy(scope.TOUCHES[0]);
      scope.direct.sub(scope.LAST[0]);
      scope.LAST[0].copy(scope.TOUCHES[0]);
    }
  }

  this.mouseup = function(event){
    switch( event.button ){
      case(0):
      scope.PRIMARY_CLICK = false;
      break;
      case(2):
      scope.SECONDARY_CLICK = false;
      break;
    }

  }

  this.connect = function(){

    window.addEventListener('touchstart', scope.start);
    window.addEventListener('touchmove' , scope.move);
    window.addEventListener('touchend'  , scope.release);

    window.addEventListener('mousedown', scope.mousedown);
    window.addEventListener('mousemove', scope.mousemove);
    window.addEventListener('mouseup'  , scope.mouseup);

  }

  this.disconnect = function(){

    window.removeEventListener('touchstart', scope.start);
    window.removeEventListener('touchmove' , scope.move);
    window.removeEventListener('touchend'  , scope.release);

    window.removeEventListener('mousedown', scope.mousedown);
    window.removeEventListener('mousemove', scope.mousemove);
    window.removeEventListener('mouseup'  , scope.mouseup);

  }
}
