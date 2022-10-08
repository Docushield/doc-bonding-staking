function FlexColumn(props) {

  return (
    <div className={`h-auto flex flex-col place-items-center items-stretch ${props.className}`}>
      {props.children}
    </div>
  )
}

export default FlexColumn
