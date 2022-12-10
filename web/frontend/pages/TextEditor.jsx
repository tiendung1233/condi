import "./init"
import React, { Component, useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw, convertFromHTML } from "draft-js";
import Icons from "./images/icons";
import './main.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

function TextEditor(props) {
  const fetchAPI = useAuthenticatedFetch()
  const [editorState, setEditorState] = useState(EditorState.createWithContent(

    ContentState.createFromBlockArray(
      convertFromHTML('<p></p>')
    )
  ))
  const [check, setCheck] = useState(false)
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState)
  };
  const sendData = () => {
    props.parentCallback(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  }
  sendData()

  useEffect(() => {
    fetchAPI(`/api/get/${props.bodyHtml}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEditorState(EditorState.createWithContent(
          ContentState.createFromBlockArray(
            convertFromHTML(data.body_html)
          )
        ))
      })
  }, [])


  return (
    <div>

      <button onClick={() => {
        if (check === false) {
          setCheck(true)
        } else {
          setCheck(false)
        }
      }} className='show-html'>
        {`<>`}
      </button>
      {check === false &&
        <Editor
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          toolbarClassName="demo-toolbar-custom background"
          wrapperClassName="demo-wrapper "
          editorClassName="demo-editor-custom conten"
          toolbar={{
            options: ['blockType', 'inline', 'textAlign', 'colorPicker', 'link', 'embedded', 'image', 'remove'],
            inline: {
              options: ['bold', 'italic', 'underline',],
              bold: { icon: Icons.bold, className: ' btn demo-option-custom' },
              italic: { icon: Icons.italic, className: 'btn demo-option-custom' },
              underline: { icon: Icons.underline, className: 'btn  demo-option-custom  mg-icon' },

            },
            blockType: { className: ' demo-option-custom-wide', dropdownClassName: 'demo-dropdown-custom' },
            list: {
              unordered: { icon: Icons.unordered, className: 'demo-option-custom btn' },
              ordered: { icon: Icons.ordered, className: 'demo-option-custom btn' },
              indent: { icon: Icons.indent, className: 'demo-option-custom btn' },
              outdent: { icon: Icons.outdent, className: 'demo-option-custom btn' },
            },
            textAlign: {
              left: { icon: Icons.left, className: 'demo-option-custom btn' },
              center: { icon: Icons.center, className: 'demo-option-custom btn' },
              right: { icon: Icons.right, className: 'demo-option-custom btn' },
              justify: { icon: Icons.justify, className: 'demo-option-custom btn  mg-icon' },
            },
            fontFamily: { className: 'demo-option-custom btn-wide', dropdownClassName: 'demo-dropdown-custom' },
            colorPicker: { className: 'demo-option-custom btn', popupClassName: 'demo-popup-custom' },
            link: {
              popupClassName: 'demo-popup-custom',
              link: { icon: Icons.link, className: 'demo-option-custom btn' },
              unlink: { icon: Icons.unlink, className: 'demo-option-custom btn' },
            },
            emoji: { className: 'demo-option-custom btn', popupClassName: 'demo-popup-custom' },
            embedded: { className: 'demo-option-custom btn', popupClassName: 'demo-popup-custom' },
            image: { icon: Icons.image, className: 'demo-option-custom btn', popupClassName: 'demo-popup-custom' },
            remove: { icon: Icons.eraser, className: 'demo-option-custom btn' },

          }}
        />
      }
      {check === true &&
        <textarea
          className="input-html"
          defaultValue={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
        ></textarea>
      }

    </div>
  );
}

export default TextEditor;