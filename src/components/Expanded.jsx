function Expanded(props) {

  return (
    <div className={`flex-1 ${props.className}`}>
      {props.children}
    </div>
  )
}

export default Expanded
