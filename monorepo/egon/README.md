<div id="top"></div>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
<!-- END OF PROJECT SHIELDS -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <a href="https://wsp-consulting.de/en/home-en/">
        <img src="https://raw.githubusercontent.com/Miragon/egon.io/refs/heads/build-vsce-package/monorepo/egon/images/wps-icon.ico" alt="WPS Logo" height="180">
    </a>
    <h3>Egon - The Domain Story Modeler</h3>
    <p>
        <i>A tool to visualize Domain Stories in your browser.</i>
        <br />
        <a href="https://github.com/WPS/egon.io/issues">Report Bug</a>
        ·
        <a href="https://github.com/WPS/egon.io/pulls">Request Feature</a>
    </p>
</div>

## About The Project

- See http://domainstorytelling.org for more information on Domain Storytelling.
- The [Egon.io Website](https://egon.io/) contains a user manual.

## Getting started

We use [Nx](https://nx.dev/) as our monorepo management tool.
To test the application locally, follow these steps:

1. Install dependencies:
   ```shell
   yarn
   ```
2. Start a development server:
   ```shell
   yarn nx run diagram-js-egon-plugin:build # has to be run once because of css
   yarn nx run egon-modeler-webview:serve
   ```

## Documentation

## Contributing

Contributions are what make the open source community such an amazing place to learn,
inspire, and create.
Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please open an issue with the tag
`enhancement`, fork the repo and create a pull request.
You can also simply open an issue with the tag `enhancement`.
Please use semantic commit messages as described
in [here](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).  
Don't forget to give the project a star! Thanks again!

1. Open an issue with the tag "enhancement"
2. Fork the Project
3. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

Distributed under this [license](LICENSE).

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/wps/egon.io.svg?style=for-the-badge

[contributors-url]: https://github.com/wps/egon.io/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/wps/egon.io.svg?style=for-the-badge

[forks-url]: https://github.com/wps/egon.io/network/members

[stars-shield]: https://img.shields.io/github/stars/wps/egon.io.svg?style=for-the-badge

[stars-url]: https://github.com/wps/egon.io/stargazers

[issues-shield]: https://img.shields.io/github/issues/wps/egon.io.svg?style=for-the-badge

[issues-url]: https://github.com/wps/egon.io/issues

[license-shield]: https://img.shields.io/github/license/wps/egon.io.svg?style=for-the-badge

[license-url]: https://github.com/wps/egon.io/blob/main/LICENSE
