import React, { Component } from 'react';
import '../cssFile/uploadPic.css';

class UploadPic extends Component {

  render() {
    return (
      <div>
          <form action="/uploadPic" method="POST" enctype="multipart/form-data" >
            <input type="file" name="uploadImage" />
            <input type="submit" value="UPLOAD" className="uploadButton"/>
          </form>
      </div>
    );
  }
}

export default UploadPic;