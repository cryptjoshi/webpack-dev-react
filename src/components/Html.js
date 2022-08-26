import React from "react"
import PropTypes from 'prop-types';
 
class Html extends React.Component  {

    static propTypes = {
        title: PropTypes.string,
        descriptions: PropTypes.string,
        image: PropTypes.string,
        lang:PropTypes.string,
        styles: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            cssText: PropTypes.string,
          })),
        scripts: PropTypes.arrayOf(PropTypes.string),
    }

    render() {
        const {title,descriptions,image,children,lang,scripts,styles} = this.props
    return (
        <html className="no-js" lang={lang}>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <title>{title}</title>
          <meta name="description" content={descriptions} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={descriptions} />
          <meta property="og:image" content={image} />
          <meta name="twitter:card" content="photo" />
          <meta name="twitter:image" content={image} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={descriptions} />
          <meta name="theme-color" content="#ffffff"></meta>
          <link rel="favicon" href="apple-touch-icon.png" />
          {styles && styles.map(style =>
              <style
                key={style.id}
                id={style.id}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: style.cssText }}
              />,
            )}
        </head>
        <body>
        <div
            id="root"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: children }}
            />
             {scripts && scripts.map(script => <script key={script} src={script} />)}
        </body>
        </html>
    )
    }
}

export default Html
